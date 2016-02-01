//Main Advisor Controller that handles root dashboard
angular.module('smApp').controller('advisorController', ['$scope', '$http', '$location', 'notificationFactory', 'AuthService', '$cookies',
    function($scope, $http, $location, notificationFactory, AuthService, $cookies) {

        //Instantiates templateURL for dashboard constant at parent scope so subsequent child
        //controllers can modify it
        $scope.templateURL = 'partials/viewstudents.html';
        //Get username and type at parent scope
        $scope.username = AuthService.getusername();
        $scope.lastname = AuthService.getlastname()
        $scope.usertype = AuthService.getusertype();

        //Talk with database to get classes and department in parent scope so they won't
        //have to be fetched again letter
        $http({
                method: 'GET',
                url: '/classes'

            }).success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.dpts = data.dpts;
                $scope.courses = data.courses;
                //While at it, also get advisor's student details and appointment times
                $http({
                        method: 'POST',
                        url: '/advisorstudentdetails',
                        data: {
                            _id: AuthService.getuserid()
                        }
                    }).success(function(data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                        $scope.studentlist = data.advisee;
                        $scope.myappointmentTimes = data.appointmentTimes;

                    })
                    .error(function(data, status, headers, config) {
                        notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
                    });


            })
            .error(function(data, status, headers, config) {
                notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
            });
        //Setter for templateURL needed because of how prototypical inheritance works
        $scope.settemplateURL = function(temp) {
            $scope.templateURL = temp;
        };
        //Template URL watch to see if advisor is registered. If not don't let in until password change
        $scope.$watch('templateURL', function(val) {
            if (AuthService.isRegistered()) { //Authservice function to see if user is registered
                if ($scope.templateURL != "partials/advisorsettings.html") {
                    notificationFactory.warning("Change your settings to proceed.");
                }
                $scope.templateURL = "partials/advisorsettings.html"
            } else { //User is registered
                $scope.templateURL = val;
            }


        });


        //Logout function that utilizes factory service 
        $scope.logout = function() {
            //Debug: Sanitize appointment times here
            AuthService.logout();
            notificationFactory.info("Logged out succesfully!")
            $location.url('/login');
        };

    }
]);

//Controller that handles advisor's current advising request
angular.module('smApp').controller('viewadivisingrequests', ['$scope', '$location', 'notificationFactory', '$uibModal', '$http', 'AuthService',
    function($scope, $location, notificationFactory, $uibModal, $http, AuthService) {


        //Helper function that changes current hour and minutes to index of array 
        $scope.hourtoIndex = function(hour, minutes) {
            return (((hour - 1) * 4) + (minutes / 15));
        }
        //Helper function that changes index to hour and minutes
        $scope.indexTohour = function(index) {

            if (((Math.floor(index / 4)) + 1) > 12) {
                //Debug: Added one to index minutes which should be faulty but isnt. Keep an eye out
                $scope.retval = (((Math.floor(index / 4)) + 1) - 12) + ((((index % 4) * 15) == 0) ? '' : ':' + ((parseInt(index + 1) % 4) * 15)) + 'PM';
            } else {
                //Debug: Added one to index minutes which should be faulty but isnt. Keep an eye out
                $scope.retval = (((Math.floor(index / 4)) + 1)) + ((((index % 4) * 15) == 0) ? '' : ':' + ((parseInt(index + 1) % 4) * 15)) + 'AM';

            }
            return $scope.retval;
        }

        //Show time of certain day
        //time -> date to view
        //To show times, first we loop through the 96 indexes or appointment times array.
        //Start and end times are added to local array
        //Check is 0 & 95'th index are taken. If they are this means first and last values needed to be swapped and place next to each other.
        //Because times moves in circuler manner
        //If only two index in an array, only one time slot has been used for that particular date
        $scope.showtimes = function(time) {
            $scope.starteend = new Array();

            if (!angular.isUndefinedOrNull(time)) {
                for (var i = 0; i < time.length; i++) {

                    if (!angular.isUndefinedOrNull(time[i])) {
                        if (!angular.isUndefinedOrNull(time[i]).state) {

                            if ((time[i].state == 'true' && angular.isUndefinedOrNull(time[(((i - 1) % 96) + 96) % 96])) || (time[i].state == 'true' && angular.isUndefinedOrNull(time[(i + 1) % 96]))) {
                                $scope.starteend.push(i);
                            } // main state true
                        } //second state defined check
                    } // slot is defined check

                } // for oop


                if (!angular.isUndefinedOrNull(time[0])) {
                    if (!angular.isUndefinedOrNull(time[95])) {

                        if (!angular.isUndefinedOrNull(time[0]).state) {
                            if (!angular.isUndefinedOrNull(time[95]).state) {
                                if ((time[0]).state == 'true' && (time[95]).state == 'true') {
                                    $scope.starteend.push($scope.starteend[0]);
                                    $scope.starteend.splice(0, 1);
                                }
                            }
                        }
                    }
                }

                //If only one slot is gotten on day change data stucture accordingly
                if ($scope.starteend.length) {
                    if ($scope.starteend.length == 2) {
                        // $scope.returnval = $scope.indexTohour($scope.starteend[0]);


                        return $scope.indexTohour($scope.starteend[0]) + ' to ' + $scope.indexTohour(($scope.starteend[1] + 1) % 96);
                    } else {
                        $scope.returnvalappt = $scope.indexTohour($scope.starteend[0]) + ' to ' + $scope.indexTohour(($scope.starteend[1] + 1) % 96);
                        for (var j = 2; j < $scope.starteend.length; j = j + 2) {
                            $scope.returnvalappt = $scope.returnvalappt + ', ' + $scope.indexTohour($scope.starteend[j]) + ' to ' + $scope.indexTohour(($scope.starteend[j + 1] + 1) % 96);
                        }
                        return $scope.returnvalappt;
                    };

                } else {
                    return 'None';
                };

            } //main if statement



        }

        //Conver date object to user friendly format 
        $scope.convertdateformat = function(date) {
            return ((date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear());
        }

        // Today date
        $scope.todayfullDay = new Date();
        $scope.today = new Date().getDay();

        //Today
        $scope.datetoview = $scope.convertdateformat($scope.todayfullDay);


        $scope.showapptdate = 0;
        $scope.lastweekBegin = new Date();
        //Fill an local multidimensional array with 4 weeks worth of date
        //8 instead of  7 cuz 1 is being added later
        $scope.lastweekBegin = new Date($scope.lastweekBegin.setDate($scope.lastweekBegin.getDate() - (7 + ($scope.today))));
        $scope.dateArray = new Array(4);
        $scope.dateArray[0] = new Array(7);
        $scope.dateArray[1] = new Array(7);
        $scope.dateArray[2] = new Array(7);
        $scope.dateArray[3] = new Array(7);

        //Conver those dates to user friendly format and push it to local array
        for (var a = 0; a < 4; a++) {
            for (var b = 0; b < 7; b++) {
                $scope.dateArray[a][b] = $scope.convertdateformat($scope.lastweekBegin);
                $scope.lastweekBegin = new Date($scope.lastweekBegin.setDate($scope.lastweekBegin.getDate() + 1));
            }
        }

        //Search appointment times on advisor appointmenttimes array
        //idx is date to search
        $scope.searchappointment = function(idx) {
                $scope.showapptdate = 1;
                $scope.datetosearch = $scope.datetoview;
                $scope.appointmentsgotten = new Array();
                $scope.studentids = new Array();
                for (var key in $scope.myappointmentTimes) {
                    if ($scope.myappointmentTimes.hasOwnProperty(key)) {
                        for (i = 0; i < $scope.myappointmentTimes[key].length; i++) {

                            if (!angular.isUndefinedOrNull($scope.myappointmentTimes[key][i])) {
                                if (!angular.isUndefinedOrNull($scope.myappointmentTimes[key][i].state)) {
                                    if (!angular.isUndefinedOrNull($scope.myappointmentTimes[key][i].appointmentDate)) {
                                        for (j = 0; j < $scope.myappointmentTimes[key][i].appointmentDate.length; j++) {
                                            if ($scope.datetosearch == $scope.convertdateformat(new Date($scope.myappointmentTimes[key][i].appointmentDate[j]))) {
                                                $scope.tempInfo = {};
                                                $scope.tempInfo['timeslot'] = i;
                                                $scope.tempInfo['appointmentRequestTime'] = $scope.myappointmentTimes[key][i]['appointmentRequestTime'][j];
                                                $scope.tempInfo['appointmentDate'] = $scope.myappointmentTimes[key][i]['appointmentDate'][j];
                                                //Line below could be commented out later
                                                $scope.tempInfo['studentid'] = $scope.myappointmentTimes[key][i]['studentid'][j];
                                                $scope.tempInfo['note'] = $scope.myappointmentTimes[key][i]['note'][j];
                                                $scope.studentids.push($scope.myappointmentTimes[key][i]['studentid'][j]);
                                                $scope.appointmentsgotten.push($scope.tempInfo);
                                            } //Main if statement to check
                                        } //Match inside appointment date array 
                                    } // If to check appointment date array
                                } //If to check appointment state slot
                            } //If to check state 
                        } //For loop to loop inside a whole day            
                    } //If to check if has own property
                } //For to loop through keys


                //Communicate with database to get student info for those students who have appointment set up for that
                //particular day
                $http({
                        method: 'POST',
                        url: '/populatestudentids',
                        // set the headers so angular passing info as form data (not request payload)
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: {
                            studentids: $scope.studentids
                        }

                    }).success(function(data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                        $scope.studentids = data;


                    })
                    .error(function(data, status, headers, config) {

                    });

            } //End search appointment function

        //Helper function to change index to hour in AM/PM format for users
        $scope.indexTohour = function(index) {
            if (index < 47) {
                $scope.valtoreturn = ((Math.floor(index / 4)) + 1);
            } else {
                $scope.valtoreturn = (((Math.floor(index / 4)) + 1) - 12);
            }

            if ((index % 4) == 0) {
                if (index < 47) {
                    $scope.valtoreturn = $scope.valtoreturn + 'AM';
                } else {
                    $scope.valtoreturn = $scope.valtoreturn + 'PM';
                }
            } else {
                $scope.valtoreturn = $scope.valtoreturn + ':' + ((index % 4) * 15);


                if (index < 47) {
                    $scope.valtoreturn = $scope.valtoreturn + 'AM';
                } else {
                    $scope.valtoreturn = $scope.valtoreturn + 'PM';
                }
            }

            return $scope.valtoreturn;
        }

    } //End controller

]);


//Controller that handles view student
angular.module('smApp').controller('advisorviewstudents', ['$scope', 'notificationFactory', '$uibModal', '$http', 'AuthService',
    function($scope, notificationFactory, $uibModal, $http, AuthService) {
        //Default local variables
        $scope.pageSize = AuthService.getPaginationSize();
        $scope.currentPage = 1;
        $scope.divshow = 1;
        //Watches pagesize to store value in factory
        $scope.$watch('pageSize', function(val) {
            AuthService.setPaginationSize(val);
        });

        //Set cheksheet to view and show user the checksheet they chose
        $scope.viewstudentchecksheet = function(checksheet, checksheetdata) {
            $scope.divshow = '0';
            $scope.checksheetinview = checksheet;
            $scope.checksheetdata = checksheetdata;
            //Vales to hold checksheet summary information
            $scope.complete = 0;
            $scope.incomplete = 0;
            $scope.blocksummarycomplete = new Array($scope.checksheetdata.length);
            for (i = 0; i < $scope.blocksummarycomplete.length; i++) {
                $scope.blocksummarycomplete[i] = 0;
            }
            $scope.blocksummaryincomplete = new Array($scope.checksheetdata.length);

            //Loops to calculate %complete for that particulat checksheet
            for (i = 0; i < $scope.blocksummaryincomplete.length; i++) {
                $scope.blocksummaryincomplete[i] = 0;
            }
            for (i = 0; i < $scope.checksheetdata.length; i++) {
                for (j = 0; j < $scope.checksheetdata[i].length; j++) {
                    if (!angular.isUndefinedOrNull($scope.checksheetdata[i][j])) {
                        if (!angular.isUndefinedOrNull($scope.checksheetdata[i][j].suffix)) {
                            $scope.complete = $scope.complete + 1;
                            $scope.blocksummarycomplete[i] = $scope.blocksummarycomplete[i] + 1;
                        } //if statement
                        else {
                            $scope.incomplete = $scope.incomplete + 1;
                            $scope.blocksummaryincomplete[i] = $scope.blocksummaryincomplete[i] + 1;
                        }

                    } //outer if
                    else {
                        $scope.incomplete = $scope.incomplete + 1;
                        $scope.blocksummaryincomplete[i] = $scope.blocksummaryincomplete[i] + 1;
                    }
                } //for j
            } //for i 

        }

        //Helper function called by view's ng-if or ng-class
        $scope.isFilled = function(pid, id) {
            if (angular.isUndefinedOrNull($scope.checksheetdata[pid][id])) {
                return true;
            } else {
                if (angular.isUndefinedOrNull($scope.checksheetdata[pid][id].prefix)) {
                    return true;
                }
                return false;
            }

        }
        //Simple div change called by view
        $scope.switchdiv = function() {
            $scope.divshow = '1';
        }

        //Calls modal so that student can modify student information
        //student -> student to modify
        $scope.advisormodifystudent = function(student) {

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/advisormodifystudentmodal.html',
                controller: 'advisormodifystudentmodal',
                scope: $scope,
                resolve: {
                    student: function() {
                        return student;
                    }
                }
            });
        }

        //Calls modal so checksheet's information can be viewed
        $scope.showchecksheetinfo = function(checksheet) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/advisorviewchecksheetinfo.html',
                controller: 'advisorviewchecksheetinfo',
                scope: $scope,
                resolve: {
                    checksheet: function() {
                        return checksheet;
                    }
                }
            });

        }



    }
]);

//Controller that lets advisor modify student's modal.
angular.module('smApp').controller('advisormodifystudentmodal', ['$scope', '$location', 'notificationFactory', 'AuthService', '$http', '$uibModalInstance', 'student',
    function($scope, $location, notificationFactory, AuthService, $http, $uibModalInstance, student) {

        //Deep copy of student object. This is because angular assigns stuff by reference by default
        $scope.newstudentID = angular.copy(student);
        $scope.studentName = $scope.newstudentID.name;

        //Cancel modal
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        //Delete student from database
        $scope.delete = function() {
            $http({
                    method: 'DELETE',
                    url: '/existingstudent',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        deleteID: student._id
                    }

                }).success(function(data, status, headers, config) {
                    // this callback will be called asynchronously
                    // when the response is available
                    $uibModalInstance.dismiss('cancel');


                    if (status === 200) {
                        //Modify local data structure so that view is changed accordingly
                        $scope.studentlist.splice($scope.studentlist.indexOf(student), 1);
                        notificationFactory.info("Successfully deleted student.");
                    }

                })
                .error(function(data, status, headers, config) {
                    $uibModalInstance.dismiss('cancel');
                    notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")
                });


        };


        // Modify student information on the database
        $scope.modify = function() {
            // create a new instance of deferred
            $http({
                    method: 'PUT',
                    url: '/existingstudent',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        newstudentID: $scope.newstudentID
                    }

                }).success(function(data, status, headers, config) {
                    // this callback will be called asynchronously
                    // when the response is available
                    $uibModalInstance.dismiss('cancel');
                    //$location.url('/root/dashboard');

                    if (status === 200) {
                        angular.copy($scope.newstudentID, student);

                        notificationFactory.info("Successfully updated student");
                    }

                })
                .error(function(data, status, headers, config) {

                    $uibModalInstance.dismiss('cancel');
                    notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")
                });
        };


    }
]);


//Controller to let advisor view checksheet info on a modal
angular.module('smApp').controller('advisorviewchecksheetinfo', ['$scope', '$uibModalInstance', 'checksheet',
    function($scope, $uibModalInstance, checksheet) {

        $scope.checksheettoview = checksheet;


        //Cancel modal for department
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

    }
]);


//Controller that handles block creation for checksheet
angular.module('smApp').controller('blockController', ['$scope', '$http', 'notificationFactory', 'AuthService', '$cookies',
    function($scope, $http, notificationFactory, AuthService, $cookies) {

        //Default block json declared to to be added to the database
        $scope.block = {};
        $scope.block.creator = $scope.username + " " + $scope.lastname;
        $scope.block.creatorID = AuthService.getuserid();

        //Splice elective option from array
        $scope.removeoption = function(idx) {
            $scope.block.electivechoices.splice(idx, 1)
        }

        //Array intialized to hold block details so that it can be bound to view
        $scope.block.details = [];
        //Default variables initialized to show changes in view
        $scope.divshow = true;

        //Build block function that creates array according to given number
        $scope.buildBlock = function(num) {
            $scope.divshow = false;
            $scope.block.details = new Array(num);
            $scope.block.electivechoices = [];
        };

        //Watch for change in length of block details
        $scope.$watch('block.details.length', function(val) {
            $scope.block.slot = val;
        });

        //Remove slot form block array
        $scope.removeslot = function(idx) {
            $scope.block.details.splice(idx, 1);
        }

        //Add slot to block array
        $scope.addSlot = function() {
            $scope.block.details.length = $scope.block.details.length + 1;

        };

        //Add elective to block's elective choices       
        $scope.addelectiveoption = function(p, s) {
            $scope.block.electivechoices.push({
                "prefix": p,
                "suffix": s
            });
        }

        //Adds slots to the blocks and submits it to the database
        $scope.submitSlot = function() {

            //Block json object is trimmed and made fit before submitting it to database by
            //changing structure according to block type and removing unnecessary attributes
            if ($scope.block.type != "Electives") {
                delete $scope.block.electivechoices;
            }
            $scope.block.credits = 0;
            angular.forEach($scope.block.details, function(value, index) {
                if (value.rule == "None" || angular.isUndefined(value.rule) || value.rule === null) {
                    delete value['rule'];
                    delete value['ruleconstraint'];
                }

                if (value.prerequisite == "None" || angular.isUndefined(value.prerequisite) || value.prerequisite === null) {
                    delete value['prerequisite'];
                    delete value['prereqconstraint'];
                    if (value.hascredit == "True") {
                        $scope.block.credits = $scope.block.credits + 3;
                    }
                }
            });

            //Add blocks to the database
            $http({
                    method: 'POST',
                    url: '/blocks',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        arraytoAdd: $scope.block
                    }

                }).success(function(data, status, headers, config) {
                    //Template will be set to show new advisors once addadvisor has been completed
                    $scope.settemplateURL('partials/radvisor.html');
                    notificationFactory.info("Successfully added block to database! ");
                })
                .error(function(data, status, headers, config) {
                    notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")

                });
        };

    }
]);

//Controller designed to handle mixing of one or more checksheet block for the creation of a checksheet
angular.module('smApp').controller('blockviewer', ['$scope', '$http', '$uibModal', 'notificationFactory', 'AuthService',
    function($scope, $http, $uibModal, notificationFactory, AuthService) {
        //Talk with database to get current blocks
        $http({
                method: 'GET',
                url: '/blocks'

            }).success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.blocks = data;

            })
            .error(function(data, status, headers, config) {
                notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
            });

        //Initialize default local scope values
        $scope.divshow = true; //Div show utilized by ng-if/gng-show
        $scope.currentPage = 1;
        $scope.pageSize = AuthService.getPaginationSize();
        $scope.cancelsub = function() {
            $scope.divshow = true;
        }
        //Modify a block
        $scope.modifyBlock = function(blkID) {
            $scope.divshow = false;
            $scope.currentBlock = blkID;
            //Deep copy of department object. This is because angular assigns stuff by reference by default
            $scope.newID = angular.copy(blkID);
            $scope.blkName = $scope.newID.name;
        };

        //Submit modified block to database
        $scope.submitmodifiedBlock = function() {

            $http({
                    method: 'PUT',
                    url: '/blocks',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        newID: $scope.newID
                    }

                }).success(function(data, status, headers, config) {
                    // this callback will be called asynchronously
                    // when the response is available


                    if (status === 200) {
                      //Update local value to make reflect changes in client side as well
                        angular.copy($scope.newID, $scope.currentBlock);
                        notificationFactory.info("Successfully updated: " + $scope.newID.name)
                        $scope.divshow = true;
                    }

                })
                .error(function(data, status, headers, config) {

                    notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")
                });
        }




    }
]);


//Controller for modal to modify checksheet
angular.module('smApp').controller('checksheetModalController', ['$scope', '$uibModalInstance', 'chksID', '$http', 'notificationFactory', '$location',
    function($scope, $uibModalInstance, chksID, $http, notificationFactory, $location) {

        //Deep copy of checksheet object. This is because angular assigns stuff by reference by default
        $scope.newID = angular.copy(chksID);
        $scope.chksName = $scope.newID.name;

        //Cancel modal for checksheet
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };


        // Modify checksheet information on the database
        $scope.modify = function() {
            // create a new instance of deferred
            $http({
                    method: 'PUT',
                    url: '/checksheets',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        newID: $scope.newID
                    }

                }).success(function(data, status, headers, config) {
                    // this callback will be called asynchronously
                    // when the response is available
                    $uibModalInstance.dismiss('cancel');
                    //$location.url('/root/dashboard');

                    if (status === 200) {
                        angular.copy($scope.newID, chksID);

                        notificationFactory.info("Successfully updated: " + $scope.newID.name)
                    }

                })
                .error(function(data, status, headers, config) {
                    $uibModalInstance.dismiss('cancel');
                    notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")
                });
        };

    }
]);



//Controller designed to viewing of checksheet
angular.module('smApp').controller('checksheetviewer', ['$scope', '$http', '$uibModal', 'notificationFactory', 'AuthService', '$cookies',
    function($scope, $http, $uibModal, notificationFactory, AuthService, $cookies) {

        //Get checksheets from database
        $http({
                method: 'GET',
                url: '/checksheets'

            }).success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.checksheets = data;

            })
            .error(function(data, status, headers, config) {
                notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
            });

        $scope.currentPage = 1;
        $scope.pageSize = AuthService.getPaginationSize();

        //Create modal to let user modify checksheet
        $scope.modifyChecksheet = function(chksID) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/checksheetModal.html',
                controller: 'checksheetModalController',
                scope: $scope,
                resolve: {
                    chksID: function() {
                        return chksID;
                    }
                }
            });


        };




    }
]);




// Student controller that handles advisor's profile
angular.module('smApp').controller('advisorprofilecontroller', ['$scope', 'notificationFactory', 'AuthService', '$http', '$uibModal',
    function($scope, notificationFactory, AuthService, $http, $uibModal) {

        //Get data for advisor's profile as they are not gotten in default
        $http({
                method: 'POST',
                url: '/advisorprofile',
                data: {
                    _id: AuthService.getuserid()
                }
            }).success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                //Set local data stucture to data so that the changes are reflected in view
                $scope.advisorprofile = data;
            })
            .error(function(data, status, headers, config) {
                notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
            });


    }
]);


//Controller designed to set advising time by the advisor
angular.module('smApp').controller('setadvisingcontroller', ['$scope', '$http', '$location', 'notificationFactory', 'AuthService', '$cookies',
    function($scope, $http, $location, notificationFactory, AuthService, $cookies) {

        //Global appointment length constant -> 15 minutes
        //Debug: Should change this one and make it dynamic
        $scope.appointmentLength = 15;
        //Create a data structure to hold appointment time
        //This is only used if the data stucture is not already uused by default
        $scope.appointmentTimes = {
            S: new Array(24 * 60 / ($scope.appointmentLength)),
            M: new Array(24 * 60 / ($scope.appointmentLength)),
            T: new Array(24 * 60 / ($scope.appointmentLength)),
            W: new Array(24 * 60 / ($scope.appointmentLength)),
            TH: new Array(24 * 60 / ($scope.appointmentLength)),
            F: new Array(24 * 60 / ($scope.appointmentLength)),
            SA: new Array(24 * 60 / ($scope.appointmentLength))
        };

        //Create a data structure to hold appointment time
        $scope.newTimes = {
            S: new Array(),
            M: new Array(),
            T: new Array(),
            W: new Array(),
            TH: new Array(),
            F: new Array(),
            SA: new Array()
        };
        //JSON to hold total times
        $scope.totalTime = {};
        $scope.newTimes.maxAppts = 0; //For view, shows maximum number of appointments possible for that week.
        //Helper local variables
        $scope.timeMinAMPM = "PM";
        $scope.timeMaxAMPM = "PM";

        $scope.timediff = 0;
        //Set start and end time for appointments
        $scope.setMinAMPM = function(time) {
            $scope.timeMinAMPM = time;
        }
        $scope.setMaxAMPM = function(time) {
            $scope.timeMaxAMPM = time;
        }

        //Helper function to convert hour to index of array 
        $scope.hourtoIndex = function(hour, minutes) {
            return (((hour - 1) * 4) + (minutes / 15));
        }
        //Helper function to convert index of array to hour 
        $scope.indexTohour = function(index) {
            return [((Math.floor(index / 4)) + 1), ((index % 4) * 15)];
        }

        //Add appointment times to local datastructure
        //This does not communicate with database yet.
        //Debug: utilize save changes feature here.
        $scope.addAppt = function() {
            //Local structure for appointment times
            $scope.oneSlot = {};
            $scope.arraySlot = {};
            $scope.arraySlot.state = 'true';
            if ($scope.timeMinAMPM == "PM") {
                $scope.oneSlot.minHR = parseInt($scope.timeMinHr) + 12;
            } else {
                $scope.oneSlot.minHR = parseInt($scope.timeMinHr);
            }
            if ($scope.timeMaxAMPM == "PM") {
                $scope.oneSlot.maxHR = parseInt($scope.timeMaxHr) + 12;

            } else {
                $scope.oneSlot.maxHR = parseInt($scope.timeMaxHr);

            }


            if ($scope.oneSlot.maxHR >= $scope.oneSlot.minHR) {
                $scope.oneSlot.timediff = $scope.oneSlot.maxHR - $scope.oneSlot.minHR;

            } else {
                $scope.oneSlot.timediff = 24 - ($scope.oneSlot.minHR - $scope.oneSlot.maxHR);
            }
            if ($scope.timeMinMin == '30') {
                if ($scope.oneSlot.maxHR == $scope.oneSlot.minHR) {
                    $scope.oneSlot.timediff = '24';
                }
                $scope.oneSlot.timediff = $scope.oneSlot.timediff - 0.5
            }
            if ($scope.timeMaxMin == '30') {
                if ($scope.oneSlot.maxHR == $scope.oneSlot.minHR) {

                    // $scope.timediff = '0.5';
                }
                $scope.oneSlot.timediff = $scope.oneSlot.timediff + 0.5
            }

            $scope.oneSlot.maxMin = parseInt($scope.timeMaxMin);
            $scope.oneSlot.minMin = parseInt($scope.timeMinMin);

            //Data stucture modifications from here
            if ($scope.oneSlot.timediff >= 24) {
                notificationFactory.error("You can't have more than 10 hours of appointment session at once!");

            } else if ($scope.oneSlot.timediff == 0) {
                notificationFactory.error("Minimum appointment time slot to be opened is 30 min. Try again.");
            } else {
                notificationFactory.success("Appointment schedule modified! Submit when ready.");
                $scope.newTimes[$scope.timeDay].push($scope.timeMinHr + " : " + $scope.timeMinMin + "" + $scope.timeMinAMPM + " to " + $scope.timeMaxHr + " : " + $scope.timeMaxMin + "" + $scope.timeMaxAMPM);
                if (($scope.hourtoIndex($scope.oneSlot.minHR, $scope.oneSlot.minMin)) > ($scope.hourtoIndex($scope.oneSlot.maxHR, $scope.oneSlot.maxMin))) {

                    for (i = ($scope.hourtoIndex($scope.oneSlot.minHR, $scope.oneSlot.minMin)); i < $scope.appointmentTimes[$scope.timeDay].length; i++) {

                        $scope.appointmentTimes[$scope.timeDay][i] = $scope.arraySlot;
                    }

                    for (i = 0; i < ($scope.hourtoIndex($scope.oneSlot.maxHR, $scope.oneSlot.maxMin)); i++) {

                        $scope.appointmentTimes[$scope.timeDay][i] = $scope.arraySlot;
                    }

                } else {
                    for (i = ($scope.hourtoIndex($scope.oneSlot.minHR, $scope.oneSlot.minMin)); i < ($scope.hourtoIndex($scope.oneSlot.maxHR, $scope.oneSlot.maxMin)); i++) {

                        $scope.appointmentTimes[$scope.timeDay][i] = $scope.arraySlot;
                    }
                }
                $scope.totalTime[$scope.timeDay] = 0;
                angular.forEach($scope.appointmentTimes[$scope.timeDay], function(value, index) {
                    if (value.state) {
                        $scope.totalTime[$scope.timeDay] = $scope.totalTime[$scope.timeDay] + 1;
                    }

                });


                $scope.newTimes.maxAppts = 0;


                for (var key in $scope.totalTime) {
                    if ($scope.totalTime.hasOwnProperty(key)) {
                        $scope.newTimes.maxAppts = $scope.newTimes.maxAppts + $scope.totalTime[key];
                    }
                }

            }
            $scope.dayAdded = $scope.timeDay;
        }

        //Submit appointment to database after proper datastructure has been achieved
        $scope.submitAppointments = function() {

            $http({
                    method: 'POST',
                    url: '/appointmenttimes',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        appointmentTimes: $scope.appointmentTimes,
                        _id: AuthService.getuserid()
                    }

                }).success(function(data, status, headers, config) {
                    //Template will be set to show new advisors once addadvisor has been completed
                    $scope.settemplateURL('partials/viewadvising.html');
                    notificationFactory.info("Successfully added appointment times! ");
                })
                .error(function(data, status, headers, config) {
                    notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")

                });

        }


    }
]);


//Controller designed help advisor add a new student
angular.module('smApp').controller('addnewstudentController', ['$scope', '$http', '$location', 'notificationFactory', 'AuthService', '$cookies',
    function($scope, $http, $location, notificationFactory, AuthService, $cookies) {


        //Get checksheet information from database 
        //Debug: Could be handled at parent scope to avoid unnecessary communcation with database 
        $http({
                method: 'GET',
                url: '/checksheetsinfo'

            }).success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.checksheets = data;
                $scope.studentchecksheet = $scope.checksheets[0];
                $scope.student.department = $scope.dpts[1].name;
            })
            .error(function(data, status, headers, config) {
                notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
            });

        //Generate random password from service function
        $scope.generatepwd = function() {
            return AuthService.generatePassword();
        }



        //Add new student to the database
        $scope.addnewStudent = function() {

            if (!$scope.studentchecksheet) { 
                notificationFactory.error("Error: Choose a valid checksheet prototype");
                return;
            } else {
                $scope.student.checksheetprotoid = [];
                $scope.student.advisor = [];
                $scope.student.advisor[0] = AuthService.getuserid();
                $scope.student.checksheetprotoid[0] = $scope.studentchecksheet._id;

                $http({
                        method: 'POST',
                        url: '/getchecksheetjson',
                        // set the headers so angular passing info as form data (not request payload)
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: {
                            checksheetid: $scope.studentchecksheet._id
                        }

                    }).success(function(data, status, headers, config) {
                        $scope.chksdata = data;
                        //Make changes in local datastructure to reflect necessary changes
                        for (i = 0; i < $scope.chksdata.length; i++) {
                            $scope.chksdata[i] = new Array($scope.chksdata[i]);
                            for (j = 0; j < $scope.chksdata[i].length; j++) {
                                $scope.chksdata[i][j] = {};
                            }
                        }

                        $scope.student.checksheetdata = [];
                        $scope.student.checksheetdata[0] = $scope.chksdata;
                        $http({
                                method: 'POST',
                                url: '/newstudents',
                                // set the headers so angular passing info as form data (not request payload)
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                data: {
                                    arraytoAdd: $scope.student
                                }

                            }).success(function(data, status, headers, config) {
                                //Set template to revert back to displaying department so that user can view/update newly added department
                                $scope.settemplateURL('partials/viewstudents.html');
                                $scope.studentlist.push($scope.student);
                                notificationFactory.info("Successfully added students: ");

                            })
                            .error(function(data, status, headers, config) {
                                notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")

                            });

                    })
                    .error(function(data, status, headers, config) {
                        notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")

                    });
            }
        }

    }

]);

//Let advisor set messages that can be broadcasted to all students
angular.module('smApp').controller('advisorsetannouncement', ['$scope', '$http', 'notificationFactory', 'AuthService',
    function($scope, $http, notificationFactory, AuthService) {

      //Get current advisor announcement.
      //Debug: Call this from a parent level
        $http({
                method: 'POST',
                url: '/advisorannouncement',
                data: {
                    _id: AuthService.getuserid()
                }
            }).success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.advisorannouncementdata = data.announcement;
            })
            .error(function(data, status, headers, config) {
                notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
            });

        //Update new announcement once submit button has been clicked
        $scope.updateannouncement = function() {
            $http({
                    method: 'POST',
                    url: '/updateadvisorannouncement',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        announcement: $scope.advisorannouncementdata,
                        _id: AuthService.getuserid()
                    }
                }).success(function(data, status, headers, config) {
                    //Set template to revert back to displaying department so that user can view/update newly added department
                    $scope.settemplateURL('partials/viewstudents.html');
                    notificationFactory.info("Updated advisor's announcement message. ");
                })
                .error(function(data, status, headers, config) {
                    notificationFactory.error("Error: Unable to update announcement. Try again.");
                });


        }


    }

]);


//Controller to match existing student with the advisor.
angular.module('smApp').controller('addexistingstudentController', ['$scope', '$http', '$location', 'notificationFactory', 'AuthService', '$cookies',
    function($scope, $http, $location, notificationFactory, AuthService, $cookies) {

        $http({
                method: 'GET',
                url: '/checksheetsinfo'

            }).success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.checksheets = data;
                $scope.checksheetid = $scope.checksheets[0];
                $scope.chksdepartment = $scope.dpts[1].name;

            })
            .error(function(data, status, headers, config) {
                notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
            });


        //For voew
        $scope.divshow = true;
        //Update student in the databse
        $scope.updatestudent = function() {
            //Update JSON data stucture initalize locally. This will contain data to change in database
            $scope.update = {}
            //Set necessary update
            $scope.update._id = $scope.studentdetails._id;
            $scope.update.checksheetprotoid = $scope.checksheetid._id;
            $scope.update.advisor = AuthService.getuserid();

            //Post necessary update to the database
            $http({
                    method: 'POST',
                    url: '/getchecksheetjson',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        checksheetid: $scope.checksheetid._id
                    }

                }).success(function(data, status, headers, config) {
                    //Set template to revert back to displaying department so that user can view/update newly added department
                    $scope.chksdata = data;
                    //Modify local data structure to reflect change in client side also
                    for (i = 0; i < $scope.chksdata.length; i++) {
                        $scope.chksdata[i] = new Array($scope.chksdata[i]);
                        for (j = 0; j < $scope.chksdata[i].length; j++) {
                            $scope.chksdata[i][j] = {};
                        }
                    }

                    $scope.update.checksheetdata = $scope.chksdata;
                    //Update current students data structure
                    $http({
                            method: 'PUT',
                            url: '/updatecurrentstudent',
                            // set the headers so angular passing info as form data (not request payload)
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            data: {
                                update: $scope.update
                            }

                        }).success(function(data, status, headers, config) {
                            //Template will be set to show new advisors once addadvisor has been completed
                            // $scope.settemplateURL('partials/radvisor.html');
                            notificationFactory.info("Successfully added new checksheet to student! ");
                        })
                        .error(function(data, status, headers, config) {
                            notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")

                        });

                })
                .error(function(data, status, headers, config) {
                    notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")

                });




        };

        //Search existing student from the database via their student id
        $scope.searchexistingstudent = function() {
            $scope.isCollapsed = false;
            $http({
                    method: 'POST',
                    url: '/findstudentbyid',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        studentid: $scope.studentid
                    }

                }).success(function(data, status, headers, config) {
                    $scope.studentdetails = data.student;
                    $scope.studentadvisor = data.advisor;
                    $scope.studentchecksheet = data.checksheet;
                    //To make changes to view on success
                    $scope.divshow = false;
                    notificationFactory.info("Found a student. Verify before linking to a checksheet. ");

                })
                .error(function(data, status, headers, config) {
                    notificationFactory.error("Error: Unable to find a student with: '" + $scope.studentid + "' id. Try again.");
                });
        }

    }

]);

//Controller viewing of checksheet by advisor
angular.module('smApp').controller('advisorchecksheetController', ['$scope', '$http', '$location', 'notificationFactory', 'AuthService', '$cookies',
    function($scope, $http, $location, notificationFactory, AuthService, $cookies) {

        //Method to modify templateURL 
        $http({
                method: 'GET',
                url: '/blockdetails'

            }).success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.blockdetails = data;

            })
            .error(function(data, status, headers, config) {
                notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
            });

        //Initialize checksheet json type and arrays to hold checksheet information
        $scope.checksheet = {};
        $scope.checksheet.blockid = [];
        $scope.tempblockid = [];
        //Default checksheet attributes
        $scope.checksheet.creator = $scope.username + " " + $scope.lastname;
        $scope.checksheet.credits = 0;
        $scope.checksheet.creatorID = AuthService.getuserid();
        $scope.divshow = true;

        //Watch for changes in bloc description
        $scope.$watch('blockdesc', function(val) {
            if ($scope.blockdetails) {
                for (var i = 0; i < $scope.blockdetails.length; i++) {
                    if ($scope.blockdetails[i]._id == val) {
                        $scope.blockdetail = $scope.blockdetails[i];
                        break;
                    }
                }
            }
        });

        //Add block to checksheet database
        $scope.addtochecksheet = function(val) {
            // Loop through checksheet to unsure block has not been repeated twice
            for (var i = 0; i < $scope.checksheet.blockid.length; i++) {
                if (val._id === $scope.checksheet.blockid[i]) {
                    notificationFactory.error("Error: You cannot add same block on a checksheet twice!");
                    return;
                }
            }
            $scope.checksheet.blockid.push(val._id);
            $scope.checksheet.credits = $scope.checksheet.credits + val.credits;
            $scope.tempblockid.push(val);
            $scope.blockdesc = 'None';
        }

        //Remove block from checksheet
        $scope.removeblock = function(idx) {
            $scope.checksheet.credits = $scope.checksheet.credits - $scope.tempblockid[idx].credits;
            $scope.checksheet.blockid.splice(idx, 1);
            $scope.tempblockid.splice(idx, 1);
        }

        //Submit checksheet to the checksheet database
        $scope.submitChecksheet = function() {
            $http({
                    method: 'POST',
                    url: '/checksheets',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        arraytoAdd: $scope.checksheet
                    }

                }).success(function(data, status, headers, config) {
                    //Template will be set to show new advisors once addadvisor has been completed
                    $scope.settemplateURL('partials/radvisor.html');
                    notificationFactory.info("Successfully added checksheet to database! ");
                })
                .error(function(data, status, headers, config) {
                    notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")

                });
        }

        $scope.buildChecksheet = function() {
            $scope.divshow = false;
        };
    }
]);


// Student controller that handles modification of advisor settings
angular.module('smApp').controller('advisorsettingscontroller', ['$scope', '$location', 'notificationFactory', 'AuthService', '$http',
    function($scope, $location, notificationFactory, AuthService, $http) {
        //Local data structure that holds advisors settings
        $scope.setting = {};

        $scope.updateadvisorsettings = function() {
            //Set new settings on local datastructure
            $scope.setting._id = AuthService.getuserid();
            $scope.setting.password = $scope.advisornewpassword;
            $scope.setting.registered = true;
            //Update settings on database permanently
            $http({
                    method: 'PUT',
                    url: '/advisorsetting',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        setting: $scope.setting
                    }

                }).success(function(data, status, headers, config) {
                    //Reflect changes locally for client side so they dont have to relogin
                    notificationFactory.success("Settings update succesfully.");
                    AuthService.setRegistered('true');
                    $scope.settemplateURL("partials/viewstudents.html");

                })
                .error(function(data, status, headers, config) {
                    notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
                });
        }

    }
]);