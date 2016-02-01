// Description: Contains the controllers that help with functionalities of student user group.
// Child controllers inherit from primary Parent Controller "studentController"

// Student controller that handles student dashboard and student operation
angular.module('smApp').controller('studentController', ['$scope', '$routeParams', '$location', 'notificationFactory', 'AuthService', '$http',
    function($scope, $routeParams, $location, notificationFactory, AuthService, $http) {

        //Instantiates templateURL for dashboard constant at parent scope so subsequent child
        //controllers can modify it
        $scope.templateURL = 'partials/studentsummary.html';

        //Get username and type at parent scope
        $scope.username = AuthService.getusername();
        $scope.lastname = AuthService.getlastname();
        $scope.usertype = AuthService.getusertype();
        $scope.student_id = AuthService.getuserid();
        //Method to modify templateURL 
        $scope.settemplateURL = function(temp) {
            $scope.templateURL = temp;
        };

        //Function to change index of array from 0-95 to hour and minutes in AM/PM format
        $scope.indexTohourlong = function(index) {
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

        $scope.indextoHR = function(index) {
            return [((Math.floor(index / 4)) + 1), ((index % 4) * 15)];
        };

        //Get student info
        $http({
                method: 'POST',
                url: '/students',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    studentid: $scope.student_id
                }

            }).success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.student = data.student;
                $scope.checksheets = data.checksheet
                $scope.advisors = data.advisor;

                $scope.data = [];
                $scope.yourdata = [{
                    key: "Completed",
                    y: 0
                }, {
                    key: "Remaining",
                    y: $scope.checksheets[0].credits
                }];
                //Student appts holds appointments if any set up with advisors
                $scope.studentappts = function() {
                    for (var key in $scope.advisors[0].appointmentTimes) {
                        if ($scope.advisors[0].appointmentTimes.hasOwnProperty(key)) {
                            for (i = 0; i < $scope.advisors[0].appointmentTimes[key].length; i++) {
                                if (!angular.isUndefinedOrNull($scope.advisors[0].appointmentTimes[key][i])) {
                                    if (!angular.isUndefinedOrNull($scope.advisors[0].appointmentTimes[key][i].studentid)) {
                                        for (j = 0; j < $scope.advisors[0].appointmentTimes[key][i].studentid.length; j++) {
                                            if ($scope.advisors[0].appointmentTimes[key][i].studentid[j] == AuthService.getuserid()) {

                                                return 'Appointment requested with ' + $scope.advisors[0].firstname + ' ' + $scope.advisors[0].lastname + ' from ' +
                                                    $scope.indexTohourlong(i) + ' to ' + $scope.indexTohourlong((i + 1) % 96);

                                            }
                                        }
                                     
                                    }
                                }

                            }

                        }
                    }
                    return 'none';
                }
                //Setter and getter for student appoitment
                $scope.studentappt = $scope.studentappts();
                $scope.setstudentappt = function(val) {
                    $scope.studentappt = val;
                }



                //Loop through checksheet data to create data strcuture used by pie chart
                for (i = 0; i < $scope.student.checksheetdata[0].length; i++) {
                    for (j = 0; j < $scope.student.checksheetdata[0][i].length; j++) {
                        if (!angular.isUndefinedOrNull($scope.student.checksheetdata[0][i][j])) {
                            if (!angular.isUndefinedOrNull($scope.student.checksheetdata[0][i][j].suffix)) {
                                if (!angular.isUndefinedOrNull($scope.student.checksheetdata[0][i][j].credits)) {
                                    $scope.yourdata[0].y = $scope.yourdata[0].y + $scope.student.checksheetdata[0][i][j].credits;
                                    $scope.yourdata[1].y = $scope.yourdata[1].y - $scope.student.checksheetdata[0][i][j].credits;
                                } else {
                                    $scope.yourdata[0].y = $scope.yourdata[0].y + 3;
                                    $scope.yourdata[1].y = $scope.yourdata[1].y - 3;
                                }
                            }
                            // else
                            // {

                            // }
                        }
                    }
                }
                //Create data structure for pie chart
                for (i = 0; i < $scope.checksheets[0].blockid.length; i++) {
                    $scope.data[i] = {};
                    $scope.data[i].key = $scope.checksheets[0].blockid[i].name;
                    $scope.data[i].y = $scope.checksheets[0].blockid[i].credits;
                }


               

                //Checks if student is registered for newly created account to redirect them to change their password
                if (!$scope.student.registered) {
                    notificationFactory.warning("First time login detected. Change your password to proceed.");
                    $scope.templateURL = "partials/studentsettings.html"
                } else {
                    // $scope.settemplateURL("partials/studentrequestadvising.html");
                    $scope.templateURL = "partials/studentsummary.html"
                }
            })
            .error(function(data, status, headers, config) {
                notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
            });



        //Get classes and department at parent scope so that they wont have to be called again and again later
        $http({
                method: 'GET',
                url: '/classes'

            }).success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.dpts = data.dpts;
                $scope.courses = data.courses;

            })
            .error(function(data, status, headers, config) {
                notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
            });

        //Watch for tempalteURL changes in case the student is not registered yet.
        $scope.$watch('templateURL', function(val) {
            if ($scope.student) {
                if (!$scope.student.registered) {
                    if ($scope.templateURL != "partials/studentsettings.html") {
                        notificationFactory.warning("Change your settings to proceed.");
                    }
                    $scope.templateURL = "partials/studentsettings.html"
                } else {
                    $scope.templateURL = val;
                }
            }

        });


        //Logout function that utilizes factory service 
        $scope.logout = function() {
            AuthService.logout();
            notificationFactory.info("Logged out succesfully!")
            $location.url('/login');
        };


    }
]);

// Student controller that shows students profile
angular.module('smApp').controller('studentprofilecontroller', ['$scope', 'AuthService', '$http',
    function($scope, AuthService, $http) {

      //Retrieve student information from server.
      //This is done because full profile infromation is not retrieved from server when logging in.
        $http({
                method: 'POST',
                url: '/studentprofile',
                data: {
                    //Student's mongoose id to find their information on server side
                    _id: AuthService.getuserid()
                }
            }).success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available

                $scope.studentprofile = data;
            })
            .error(function(data, status, headers, config) {
                notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
            });


    }
]);




// Student controller that handles student dashboard home page and provides summary
angular.module('smApp').controller('studentsummarycontroller', ['$scope',
    function($scope) {
        //Set options for piechart at homepage, data has already been set at parent scope
        $scope.options = {
            chart: {
                type: 'pieChart',
                height: 500,
                x: function(d) {
                    return d.key;
                },
                y: function(d) {
                    return d.y;
                },
                showLabels: true,
                duration: 500,
                labelThreshold: 0.01,
                labelSunbeamLayout: true,

                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 5,
                        left: 0
                    }
                }
            }
        };



    }
]);



// Student controller that handles student dashboard and student operation
angular.module('smApp').controller('studentadvisingappointmentController', ['$scope', '$location', 'notificationFactory', 'AuthService', '$http', '$uibModal',
    function($scope, $location, notificationFactory, AuthService, $http, $uibModal) {



        //Instantiate new date 
        $scope.date = new Date();
  
        //ConverInt helped function to increase index between 0 to 4
        $scope.converInt = function(idx) {
            return (Math.floor(idx / 4) + 1);
        }

        //Intialize view and control it with local variable 'divshow'
        $scope.divshow = '0';

        //Initalize two dates for today and another date for a week before
        $scope.todayfullDay = new Date();
        $scope.today = new Date().getDay();
        $scope.lastweekBegin = new Date();


        //8 instead of  7 because 1 is being added later
        $scope.lastweekBegin = new Date($scope.lastweekBegin.setDate($scope.lastweekBegin.getDate() - (8 + ($scope.today))));
        //Date array is used to fill 4 weeks worth of date to be used im view
        $scope.dateArray = new Array(4);
        $scope.dateArray[0] = new Array(7);
        $scope.dateArray[1] = new Array(7);
        $scope.dateArray[2] = new Array(7);
        $scope.dateArray[3] = new Array(7);

        //Fill date array with dates starting from last week to 4 weeks
        for (var a = 0; a < 4; a++) {
            for (var b = 0; b < 7; b++) {
                $scope.dateArray[a][b] = ($scope.lastweekBegin);
                $scope.lastweekBegin = new Date($scope.lastweekBegin.setDate($scope.lastweekBegin.getDate() + 1));
            }
        }

        // Checks if slot has been taken by student. This is called from view.
        // datetocheck -> Date thats being checks
        // hour, a, b -> Time of day and indexes of multidimensional array being checked
        $scope.findifSlotTaken = function(datetocheck, hour, a, b) {
            $scope.green = 0;
            if (angular.isUndefinedOrNull(hour)) {

                $scope.green = 0;
            } else {
                for (j = 0; j < hour.length; j++) {
                    if ((datetocheck.getDate() == new Date(hour[j]).getDate()) && (datetocheck.getMonth()) == new Date(hour[j]).getMonth()) {
                        return '1';
                    } // Main if else  

                }

            }
            $scope.green = $scope.green * 2;

            return $scope.green;
        }

        // Debug: if you want to avoid uncesessary clicks
        // $scope.advisortoview = 0;
        // $scope.divshow = '1';

        //Val to check if student can submit an appointment slot to database
        // Initialized to 0 aka cannot submit by default
        $scope.studentsaveSubmit = '0';
        $scope.setstudentsaveSubmit = function(val) {
            $scope.studentsaveSubmit = val;
        };


        //Watch for changes in block description, ask user to save their modification if they dont submit.
        //Debug: Same feature needs to be addded in couple of other places in other user groups
        $scope.$watch('templateURL', function(newVal, oldVal) {
            if (oldVal == "partials/studentrequestadvising.html" && newVal != "partials/studentrequestadvising.html" && $scope.studentsaveSubmit == '1') {
                $confirm({
                        text: 'You are about to go to a different tab. Did you want to save the changes on your checksheet?',
                        title: 'Save changes to checksheet',
                        ok: 'Save changes',
                        cancel: 'No'
                    })
                    .then(function() {
                        $scope.submitAppointmentrequest();
                    });

            }
        });

        //Val to check if student can submit an appointment slot intialized when loaded
        // Value is 1 aka true when loaded
        $scope.studentcanSubmit = '1';
        $scope.setstudentsubmit = function(val) {
            $scope.studentcanSubmit = val;
        };
        //Array index to hour
        $scope.idxtohr = function(index) {
            return [((Math.floor((index % 97) / 4)) + 1), (((index % 96) % 4) * 15)];
        }



        //Function to show data of advisor's appointment times once student makes their advisor choice
        $scope.setdivshowtrue = function(val) {

            // Debug: Should be this if you were a good programmer
            // $scope.advisortimes = new Array($scope.advisors[val].appointmentTimes.length/4); 
            $scope.advisortimes = new Array(24);

            //Intialize json array to hold current student's data for latter use from other controllers
            $scope.currentstudentdata = {};
            // $scope.advisortimes = $scope.advisors[val].appointmentTimes;
            $scope.advisortoview = val;
            $scope.divshow = '1';



      //This is the loop where values are intialized for view
      //Debug: The lif else's can be cut down very easily using array or simple switch case. 
      for (var i = 0; i < 24; i++) {
      //Intialize advisor times for view
      $scope.advisortimes[i] = new Array();
      //Convert database array structure to flat multidimensional format
      //advisor.appointmentTime [from database] [array os json containing  more arrays]
      //changed to
      //advisortimes simple multidimensional array of size ([24] hour) with [28](4slots for each hour * 7 days) slots
      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['S'][(i * 4)]);
      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['S'][(i * 4) + 1]);
      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['S'][(i * 4) + 2]);
      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['S'][(i * 4) + 3]);
      //If to initialize data for the view
      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['S'][(i * 4)]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['S'][(i * 4)].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['S'][(i * 4)].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['S'][(i * 4)].studentid[x] == AuthService.getuserid()) {
                      //Set initial set student submit to false
                      $scope.setstudentsubmit('0');
                      //Because current slot has appointment date hold the values inside JSON currentstudent date
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['S'][(i * 4)].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['S'][(i * 4)].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['S'][(i * 4)].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(i * 4) + ' to ' + $scope.indexTohourlong(((i * 4) + 1) % 96);
                  }
              }


          }
      }


      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['S'][(i * 4) + 1]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['S'][(i * 4) + 1].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['S'][(i * 4) + 1].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['S'][(i * 4) + 1].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['S'][(i * 4) + 1].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['S'][(i * 4) + 1].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['S'][(i * 4) + 1].appointmentRequestTime[x];

                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(((i * 4) + 1) % 96) + ' to ' + $scope.indexTohourlong(((i * 4) + 2) % 96);;
                  }
              }
          }
      }

      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['S'][(i * 4) + 2]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['S'][(i * 4) + 2].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['S'][(i * 4) + 2].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['S'][(i * 4) + 2].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['S'][(i * 4) + 2].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['S'][(i * 4) + 2].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['S'][(i * 4) + 2].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(((i * 4) + 2) % 96) + ' to ' + $scope.indexTohourlong(((i * 4) + 3) % 96);
                  }
              }
          }
      }

      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['S'][(i * 4) + 3]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['S'][(i * 4) + 3].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['S'][(i * 4) + 3].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['S'][(i * 4) + 3].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['S'][(i * 4) + 3].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['S'][(i * 4) + 3].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['S'][(i * 4) + 3].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(((i * 4) + 3) % 96) + ' to ' + $scope.indexTohourlong(((i * 4) + 4) % 96);
                  }
              }
          }
      }



      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['M'][(i * 4)]);
      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['M'][(i * 4) + 1]);
      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['M'][(i * 4) + 2]);
      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['M'][(i * 4) + 3]);

      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['M'][(i * 4)]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['M'][(i * 4)].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['M'][(i * 4)].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['M'][(i * 4)].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['M'][(i * 4)].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['M'][(i * 4)].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['M'][(i * 4)].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(i * 4) + ' to ' + $scope.indexTohourlong(((i * 4) + 1) % 96);
                  }
              }
          }
      }


      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['M'][(i * 4) + 1]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['M'][(i * 4) + 1].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['M'][(i * 4) + 1].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['M'][(i * 4) + 1].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['M'][(i * 4) + 1].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['M'][(i * 4) + 1].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['M'][(i * 4) + 1].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(((i * 4) + 1) % 96) + ' to ' + $scope.indexTohourlong(((i * 4) + 2) % 96);;
                  }
              }
          }
      }

      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['M'][(i * 4) + 2]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['M'][(i * 4) + 2].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['M'][(i * 4) + 2].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['M'][(i * 4) + 2].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['M'][(i * 4) + 2].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['M'][(i * 4) + 2].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['M'][(i * 4) + 2].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(((i * 4) + 2) % 96) + ' to ' + $scope.indexTohourlong(((i * 4) + 3) % 96);
                  }
              }
          }
      }

      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['M'][(i * 4) + 3]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['M'][(i * 4) + 3].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['M'][(i * 4) + 3].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['M'][(i * 4) + 3].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['M'][(i * 4) + 3].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['M'][(i * 4) + 3].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['M'][(i * 4) + 3].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(((i * 4) + 3) % 96) + ' to ' + $scope.indexTohourlong(((i * 4) + 4) % 96);
                  }
              }
          }
      }

      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['T'][(i * 4)]);
      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['T'][(i * 4) + 1]);
      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['T'][(i * 4) + 2]);
      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['T'][(i * 4) + 3]);

      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['T'][(i * 4)]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['T'][(i * 4)].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['T'][(i * 4)].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['T'][(i * 4)].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['T'][(i * 4)].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['T'][(i * 4)].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['T'][(i * 4)].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(i * 4) + ' to ' + $scope.indexTohourlong(((i * 4) + 1) % 96);
                  }
              }
          }
      }


      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['T'][(i * 4) + 1]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['T'][(i * 4) + 1].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['T'][(i * 4) + 1].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['T'][(i * 4) + 1].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['T'][(i * 4) + 1].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['T'][(i * 4) + 1].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['T'][(i * 4) + 1].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(((i * 4) + 1) % 96) + ' to ' + $scope.indexTohourlong(((i * 4) + 2) % 96);
                  }
              }
          }
      }

      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['T'][(i * 4) + 2]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['T'][(i * 4) + 2].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['T'][(i * 4) + 2].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['T'][(i * 4) + 2].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['T'][(i * 4) + 2].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['T'][(i * 4) + 2].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['T'][(i * 4) + 2].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(((i * 4) + 2) % 96) + ' to ' + $scope.indexTohourlong(((i * 4) + 3) % 96);
                  }
              }
          }
      }

      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['T'][(i * 4) + 3]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['T'][(i * 4) + 3].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['T'][(i * 4) + 3].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['T'][(i * 4) + 3].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['T'][(i * 4) + 3].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['T'][(i * 4) + 3].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['T'][(i * 4) + 3].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(((i * 4) + 3) % 96) + ' to ' + $scope.indexTohourlong(((i * 4) + 4) % 96);
                  }
              }
          }
      }


      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['W'][(i * 4)]);
      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['W'][(i * 4) + 1]);
      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['W'][(i * 4) + 2]);
      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['W'][(i * 4) + 3]);

      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['W'][(i * 4)]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['W'][(i * 4)].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['W'][(i * 4)].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['W'][(i * 4)].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['W'][(i * 4)].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['W'][(i * 4)].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['W'][(i * 4)].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(i * 4) + ' to ' + $scope.indexTohourlong(((i * 4) + 1) % 96);

                  }
              }
          }
      }


      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['W'][(i * 4) + 1]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['W'][(i * 4) + 1].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['W'][(i * 4) + 1].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['W'][(i * 4) + 1].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['W'][(i * 4) + 1].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['W'][(i * 4) + 1].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['W'][(i * 4) + 1].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(((i * 4) + 1) % 96) + ' to ' + $scope.indexTohourlong(((i * 4) + 2) % 96);
                  }
              }
          }
      }

      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['W'][(i * 4) + 2]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['W'][(i * 4) + 2].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['W'][(i * 4) + 2].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['W'][(i * 4) + 2].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['W'][(i * 4) + 2].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['W'][(i * 4) + 2].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['W'][(i * 4) + 2].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(((i * 4) + 2) % 96) + ' to ' + $scope.indexTohourlong(((i * 4) + 3) % 96);
                  }
              }
          }
      }

      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['W'][(i * 4) + 3]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['W'][(i * 4) + 3].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['W'][(i * 4) + 3].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['W'][(i * 4) + 3].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['W'][(i * 4) + 3].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['W'][(i * 4) + 3].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['W'][(i * 4) + 3].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(((i * 4) + 3) % 96) + ' to ' + $scope.indexTohourlong(((i * 4) + 4) % 96);
                  }
              }
          }
      }

      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['TH'][(i * 4)]);
      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['TH'][(i * 4) + 1]);
      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['TH'][(i * 4) + 2]);
      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['TH'][(i * 4) + 3]);

      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['TH'][(i * 4)]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['TH'][(i * 4)].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['TH'][(i * 4)].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['TH'][(i * 4)].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['TH'][(i * 4)].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['TH'][(i * 4)].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['TH'][(i * 4)].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(i * 4) + ' to ' + $scope.indexTohourlong(((i * 4) + 1) % 96);
                  }
              }
          }
      }


      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['TH'][(i * 4) + 1]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['TH'][(i * 4) + 1].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['TH'][(i * 4) + 1].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['TH'][(i * 4) + 1].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['TH'][(i * 4) + 1].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['TH'][(i * 4) + 1].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['TH'][(i * 4) + 1].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(((i * 4) + 1) % 96) + ' to ' + $scope.indexTohourlong(((i * 4) + 2) % 96);
                  }
              }
          }
      }

      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['TH'][(i * 4) + 2]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['TH'][(i * 4) + 2].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['TH'][(i * 4) + 2].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['TH'][(i * 4) + 2].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['TH'][(i * 4) + 2].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['TH'][(i * 4) + 2].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['TH'][(i * 4) + 2].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(((i * 4) + 2) % 96) + ' to ' + $scope.indexTohourlong(((i * 4) + 3) % 96);
                  }
              }
          }
      }

      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['TH'][(i * 4) + 3]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['TH'][(i * 4) + 3].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['TH'][(i * 4) + 3].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['TH'][(i * 4) + 3].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['TH'][(i * 4) + 3].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['TH'][(i * 4) + 3].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['TH'][(i * 4) + 3].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(((i * 3) + 2) % 96) + ' to ' + $scope.indexTohourlong(((i * 4) + 4) % 96);
                  }
              }
          }
      }


      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['F'][(i * 4)]);
      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['F'][(i * 4) + 1]);
      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['F'][(i * 4) + 2]);
      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['F'][(i * 4) + 3]);

      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['F'][(i * 4)]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['F'][(i * 4)].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['F'][(i * 4)].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['F'][(i * 4)].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['F'][(i * 4)].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['F'][(i * 4)].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['F'][(i * 4)].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(i * 4) + ' to ' + $scope.indexTohourlong(((i * 4) + 1) % 96);
                  }
              }
          }
      }


      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['F'][(i * 4) + 1]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['F'][(i * 4) + 1].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['F'][(i * 4) + 1].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['F'][(i * 4) + 1].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['F'][(i * 4) + 1].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['F'][(i * 4) + 1].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['F'][(i * 4) + 1].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(((i * 4) + 1) % 96) + ' to ' + $scope.indexTohourlong(((i * 4) + 2) % 96);
                  }
              }
          }
      }

      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['F'][(i * 4) + 2]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['F'][(i * 4) + 2].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['F'][(i * 4) + 2].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['F'][(i * 4) + 2].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['F'][(i * 4) + 2].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['F'][(i * 4) + 2].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['F'][(i * 4) + 2].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(((i * 4) + 2) % 96) + ' to ' + $scope.indexTohourlong(((i * 4) + 3) % 96);
                  }
              }
          }
      }

      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['F'][(i * 4) + 3]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['F'][(i * 4) + 3].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['F'][(i * 4) + 3].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['F'][(i * 4) + 3].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['F'][(i * 4) + 3].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['F'][(i * 4) + 3].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['F'][(i * 4) + 3].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(((i * 4) + 3) % 96) + ' to ' + $scope.indexTohourlong(((i * 4) + 4) % 96);
                  }
              }
          }
      }


      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['SA'][(i * 4)]);
      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['SA'][(i * 4) + 1]);
      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['SA'][(i * 4) + 2]);
      $scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['SA'][(i * 4) + 3]);

      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['SA'][(i * 4)]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['SA'][(i * 4)].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['SA'][(i * 4)].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['SA'][(i * 4)].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['SA'][(i * 4)].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['SA'][(i * 4)].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['SA'][(i * 4)].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(i * 4) + ' to ' + $scope.indexTohourlong(((i * 4) + 1) % 96);
                  }
              }
          }
      }


      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['SA'][(i * 4) + 1]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['SA'][(i * 4) + 1].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['SA'][(i * 4) + 1].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['SA'][(i * 4) + 1].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['SA'][(i * 4) + 1].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['SA'][(i * 4) + 1].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['SA'][(i * 4) + 1].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(((i * 4) + 1) % 96) + ' to ' + $scope.indexTohourlong(((i * 4) + 2) % 96);
                  }
              }
          }
      }

      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['SA'][(i * 4) + 2]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['SA'][(i * 4) + 2].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['SA'][(i * 4) + 2].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['SA'][(i * 4) + 2].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['SA'][(i * 4) + 2].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['SA'][(i * 4) + 2].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['SA'][(i * 4) + 2].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(((i * 4) + 2) % 96) + ' to ' + $scope.indexTohourlong(((i * 4) + 3) % 96);
                  }
              }
          }
      }

      if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['SA'][(i * 4) + 3]))) {
          if (!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['SA'][(i * 4) + 3].studentid))) {
              for (var x = 0; x < $scope.advisors[val].appointmentTimes['SA'][(i * 4) + 3].studentid.length; x++) {
                  if ($scope.advisors[val].appointmentTimes['SA'][(i * 4) + 3].studentid[x] == AuthService.getuserid()) {
                      $scope.setstudentsubmit('0');
                      $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['SA'][(i * 4) + 3].appointmentDate[x];
                      $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['SA'][(i * 4) + 3].note[x];
                      $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['SA'][(i * 4) + 3].appointmentRequestTime[x];
                      $scope.currentstudentdata.appointmentTime = $scope.indexTohourlong(((i * 4) + 3) % 96) + ' to ' + $scope.indexTohourlong(((i * 4) + 4) % 96);
                  }
              }
          }
      }


            }
        }

        //Simple index to time helper function
        $scope.indextotime = function(idx) {
            if (idx == 0 || idx == 24) {
                return '12 AM';
            } else if (idx == 12) {
                return '12 PM';
            } else if (idx < 12) {
                return idx + ' AM';
            } else {
                return idx % 12 + ' PM';
            }

        }

        //Create a modal when a slot for appointment is clicked
        //hourinDay and timeSlotandDay -> two indexes of multideimnsional array
        //dateDay -> date of the slot clicked
        //slotclass -> was the slot that was clicked green/yellow/red?? [for view inside modal]
        $scope.apptslotclick = function(hourinDay, timeSlotandDay, dateday, slotclass) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/apptmakermodal.html',
                controller: 'apptmakerController',
                scope: $scope,
                resolve: {
                    hourinDay: function() {
                        return hourinDay;
                    },
                    timeSlotandDay: function() {
                        return timeSlotandDay;
                    },
                    dateday: function() {
                        return dateday;
                    },
                    slotclass: function() {
                        return slotclass;
                    }

                }
            });

        }

        //Submit appointment request to database
        $scope.submitAppointmentrequest = function() {
            //Add blocks to the database
            $scope.setstudentsaveSubmit('0');
            $scope.setstudentappt($scope.studentappts());
            $http({
                    method: 'POST',
                    url: '/requestappointment',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        appointmentTimes: $scope.advisors[$scope.advisortoview].appointmentTimes,
                        _id: $scope.advisors[$scope.advisortoview]._id
                    }

                }).success(function(data, status, headers, config) {
                    //Template will be set back to home page once appointment request has been submitted
                    $scope.settemplateURL('partials/studentsummary.html');
                    notificationFactory.info("Successfully made appointment request! ");
                })
                .error(function(data, status, headers, config) {
                    notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")

                });
        }

    }
]);

//Modal instance controller to make appointments
angular.module('smApp').controller('apptmakerController', ['$scope', '$http', '$uibModalInstance', 'hourinDay', 'timeSlotandDay', 'dateday', 'slotclass',
    function($scope, $http, $uibModalInstance, hourinDay, timeSlotandDay, dateday, slotclass) {

        //Initialize values passed from parent to local scope
        $scope.hourinDay = hourinDay;
        $scope.timeSlotandDay = timeSlotandDay;
        $scope.dateday = dateday;
        $scope.slotclass = slotclass;
        //Json to hold any edits to slot
        $scope.appointmentEdit = {};
        //Disable button by default
        $scope.buttondisabled = true;

        

        //Unlock submit on checkbox click
        $scope.unlockSubmit = function() {
            $scope.buttondisabled = !$scope.buttondisabled
        }

        //Submit appointment request to local datastructure. 
        //Note: This request is not sent to server yet
        //Debug: Add code to ask user to save changes here by adding a counter that can be accessed by parent scope here
        $scope.submitappointmentrequest = function(day, index, hourinDay, timeSlotandDay) {
            $scope.setstudentsubmit('0');
            $scope.setstudentsaveSubmit('1');

            if (angular.isUndefinedOrNull($scope.advisors[$scope.advisortoview].appointmentTimes[day][index].note)) {
                $scope.advisors[$scope.advisortoview].appointmentTimes[day][index].note = new Array();
                $scope.advisortimes[hourinDay][timeSlotandDay].note = new Array();
                $scope.advisors[$scope.advisortoview].appointmentTimes[day][index].studentid = new Array();
                $scope.advisortimes[hourinDay][timeSlotandDay].studentid = new Array();
                $scope.advisors[$scope.advisortoview].appointmentTimes[day][index].appointmentDate = new Array();
                $scope.advisortimes[hourinDay][timeSlotandDay].appointmentDate = new Array();
                $scope.advisors[$scope.advisortoview].appointmentTimes[day][index].appointmentRequestTime = new Array();
                $scope.advisortimes[hourinDay][timeSlotandDay].appointmentRequestTime = new Array();
            }

            //Debug: This line might be needed later
            // $scope.advisortimes[hourinDay][timeSlotandDay].note.push($scope.appointmentEdit.note);
            // $scope.advisortimes[hourinDay][timeSlotandDay].note.push(AuthService.getuserid());
            // $scope.advisortimes[hourinDay][timeSlotandDay].note.push($scope.todayfullDay);
            // $scope.advisortimes[hourinDay][timeSlotandDay].note.push($scope.dateday);
            $scope.advisors[$scope.advisortoview].appointmentTimes[day][index].note.push($scope.appointmentEdit.note);
            $scope.advisors[$scope.advisortoview].appointmentTimes[day][index].studentid.push(AuthService.getuserid());
            $scope.advisors[$scope.advisortoview].appointmentTimes[day][index].appointmentRequestTime.push($scope.todayfullDay);
            $scope.advisors[$scope.advisortoview].appointmentTimes[day][index].appointmentDate.push($scope.dateday);

            $uibModalInstance.dismiss('cancel');
        }

        //Set local values
        $scope.hourinDay = hourinDay;
        $scope.timeSlotandDay = timeSlotandDay;
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.indextodayarray = function(a, b) {
            return ((parseInt(a) * 4) + (Math.floor(b % 4)));
        }
        //Switch index of multidimensional array to local number
        $scope.indextoday = function(idx) {
            $scope.switchindex = (Math.floor(idx / 4));
           
            switch ($scope.switchindex) {
                case 0:
                    return 'S';
                case 1:
                    return 'M';
                case 2:
                    return 'T';
                case 3:
                    return 'W';
                case 4:
                    return 'TH';
                case 5:
                    return 'F';
                case 6:
                    return 'SA';
            }

        }

    }
]);



//Controller to view slot's info on when student is modifying their checkhsheet
angular.module('smApp').controller('viewSlotInfoController', ['$scope', '$uibModalInstance', 'pid', 'id',
    function($scope, $uibModalInstance, pid, id) {

        $scope.pid = pid;
        $scope.id = id;

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

    }
]);

//Controller to modify a slot's note
angular.module('smApp').controller('slotnoteController', ['$scope', '$uibModalInstance', 'pid', 'id',
    function($scope, $uibModalInstance, pid, id) {
        //Initialize local variables
        $scope.pid = pid;
        $scope.id = id;

        if (!($scope.checksheetdata[$scope.pid][$scope.id] === null)) {
            $scope.tempNote = $scope.checksheetdata[$scope.pid][$scope.id].note;
        } else {
            $scope.tempNote = '';
        }

        //Submit slot note, make changes to local datastructure
        //Debug: Only local data structure is changed not database. Counter could be intialized here to ask user to save changes.
        $scope.submitslotnote = function() {
            if (angular.isUndefinedOrNull($scope.checksheetdata[$scope.pid][$scope.id])) {
                $scope.checksheetdata[$scope.pid][$scope.id] = {}
                $scope.checksheetdata[$scope.pid][$scope.id].note = $scope.tempNote;

            } else {
                $scope.checksheetdata[$scope.pid][$scope.id].note = $scope.tempNote;
            }
            $uibModalInstance.dismiss('cancel');
        }
        //Cancel modal 
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

    }
]);

//Modify slot itself when student modify's checksheet
angular.module('smApp').controller('modifyslotController', ['$scope', '$location', 'notificationFactory', 'AuthService', '$http', '$uibModalInstance', 'pid', 'id',
    function($scope, $location, notificationFactory, AuthService, $http, $uibModalInstance, pid, id) {

        //Local values
        $scope.pid = pid;
        $scope.id = id;
        $scope.slotedit = {} //Json to hold local slot changes
        $scope.buttondisabled = true; //Button disabled by default

        //If slot has not been filled before intialize default values for that slot
        if (angular.isUndefinedOrNull($scope.checksheetdata[$scope.pid][$scope.id])) {
            $scope.slotedit.credits = 3;
            $scope.slotedit.note = '';
            $scope.slotedit.type = '0';
        } else {
            //If it has been filled set those values to local client side data structure
            //Local data structure is JSON $scope.slotedit
            $scope.slotedit.classprefix = $scope.checksheetdata[$scope.pid][$scope.id].prefix;
            $scope.slotedit.classsuffix = $scope.checksheetdata[$scope.pid][$scope.id].suffix;
            $scope.slotedit.note = angular.copy($scope.checksheetdata[$scope.pid][$scope.id].note);
            $scope.slotedit.credits = $scope.checksheetdata[$scope.pid][$scope.id].credits;
            //If credits is undefined set it to 3 by default
            if (($scope.checksheetdata[$scope.pid][$scope.id].credits === undefined)) {
                $scope.slotedit.credits = 3;
            } else {
                $scope.slotedit.credits = $scope.checksheetdata[$scope.pid][$scope.id].credits;
            }

            //If type is not defined set it 0
            if (!($scope.checksheetdata[$scope.pid][$scope.id].manual === undefined)) {
                $scope.slotedit.type = '1';
            } else {
                $scope.slotedit.type = '0';
            }


        }

        //Helper function called by view
        $scope.greaterThan = function(prop, val) {
            return function(item) {
                return item[prop] >= val;
            }
        }

        //Initialize checkpreq -> this says there are some prequisites by default
        $scope.checkpreq = true;

        //If prequisite data not found set it to false else check all rules
        if (!($scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prerequisite)) {
            $scope.checkpreq = false;
        } else if ($scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prerequisite == '1001') {
            for (i = 0; i < $scope.checksheetdata.length; i++) {
                for (j = 0; j < $scope.checksheetdata[i].length; j++) {
                    if (!(angular.isUndefinedOrNull($scope.checksheetdata[i][j]))) {
                        if (!(angular.isUndefinedOrNull($scope.checksheetdata[i][j].suffix))) {
                            //If statement to see if prefix and suffix matches in prequisite requirements.
                            if (($scope.checksheetdata[i][j].prefix == $scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prereqconstraint.prefix) && ($scope.checksheetdata[i][j].suffix == $scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prereqconstraint.suffix)) {
                                
                                $scope.checkpreq = false;
                                //Debug: this can be done better by using a function
                                break;
                                break;
                                break;
                                break;
                            } //if statement
                        } //if outer
                    }

                } //for j
            } //for j

        } //else if 
        //Other checksheet type
        else if ($scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prerequisite == '1002') {
            for (i = 0; i < $scope.checksheetdata.length; i++) {
                for (j = 0; j < $scope.checksheetdata[i].length; j++) {
                    if (!(angular.isUndefinedOrNull($scope.checksheetdata[i][j]))) {
                        if (!(angular.isUndefinedOrNull($scope.checksheetdata[i][j].suffix))) {
                            if (($scope.checksheetdata[i][j].prefix == $scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prereqconstraint.prefix) && ($scope.checksheetdata[i][j].suffix == $scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prereqconstraint.suffix)) {
                                for (k = 0; k < $scope.checksheetdata.length; k++) {
                                    for (l = 0; l < $scope.checksheetdata[k].length; l++) {
                                        if (!(angular.isUndefinedOrNull($scope.checksheetdata[k][l]))) {
                                            if (!(angular.isUndefinedOrNull($scope.checksheetdata[k][l].suffix))) {
                                                if (($scope.checksheetdata[k][l].prefix == $scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prereqconstraint.prefix2) && ($scope.checksheetdata[k][l].suffix == $scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prereqconstraint.suffix2)) {
                                                  
                                                    $scope.checkpreq = false;
                                                    //Debug: Use a function
                                                    break;
                                                    break;
                                                    break;
                                                    break;
                                                    break;
                                                    break;
                                                } //if statement
                                            }
                                        } //inner ifs
                                    } //for j
                                } //for j

                            } //if statement
                        }
                    } //outer ifs
                } //for j
            } //for j
        } else {
            for (i = 0; i < $scope.checksheetdata.length; i++) {
                for (j = 0; j < $scope.checksheetdata[i].length; j++) {
                    if (!(angular.isUndefinedOrNull($scope.checksheetdata[i][j]))) {
                        if (!(angular.isUndefinedOrNull($scope.checksheetdata[i][j].suffix))) {
                            if ((($scope.checksheetdata[i][j].prefix == $scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prereqconstraint.prefix) && ($scope.checksheetdata[i][j].suffix == $scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prereqconstraint.suffix)) ||
                                (($scope.checksheetdata[i][j].prefix == $scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prereqconstraint.prefix2) && ($scope.checksheetdata[i][j].suffix == $scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prereqconstraint.suffix2))) {

                                $scope.checkpreq = false;
                                break;
                                break;
                                break;
                                break;
                            } //if statement
                        }
                    } //ifs
                } //for j
            } //for j
        }

        //Checkbox to lock submit
        $scope.locksubmits = function() {
            $scope.buttondisabled = !$scope.buttondisabled
        }


        //Function to modify slot details
        $scope.modifyslotdetails = function() {
            //Change slottaken to 1
            $scope.slotedit.taken = '1';
            //Check if slot has been filled if. If filled load to local values. If not initialize default values
            if (!(angular.isUndefinedOrNull($scope.checksheetdata[$scope.pid][$scope.id]))) {

                $scope.checksheetdata[$scope.pid][$scope.id].note = $scope.slotedit.note;
                $scope.checksheetdata[$scope.pid][$scope.id].prefix = $scope.slotedit.classprefix;
                $scope.checksheetdata[$scope.pid][$scope.id].suffix = $scope.slotedit.classsuffix;
            } else {
                $scope.checksheetdata[$scope.pid][$scope.id] = {};
                $scope.checksheetdata[$scope.pid][$scope.id].note = $scope.slotedit.note;
                $scope.checksheetdata[$scope.pid][$scope.id].prefix = $scope.slotedit.classprefix;
                $scope.checksheetdata[$scope.pid][$scope.id].suffix = $scope.slotedit.classsuffix;

            }
            if ($scope.slotedit.type == '1') {
                $scope.checksheetdata[$scope.pid][$scope.id].manual = "1";
            } else {
                delete $scope.checksheetdata[$scope.pid][$scope.id].manual;
            }

            if ($scope.slotedit.credits != 3) {
                $scope.checksheetdata[$scope.pid][$scope.id].credits = $scope.slotedit.credits;
            } else {
                delete $scope.checksheetdata[$scope.pid][$scope.id].credits;
            }

            $uibModalInstance.dismiss('cancel');

        }

        $scope.cancel = function() {
           
            $uibModalInstance.dismiss('cancel');

        };


    }
]);




// Student controller that lets student view their checksheet
angular.module('smApp').controller('studentviewchecksheetcontroller', ['$scope', '$location', 'notificationFactory', 'AuthService', '$http', '$uibModal', '$confirm',
    function($scope, $location, notificationFactory, AuthService, $http, $uibModal, $confirm) {

        //Call jsPDF object to let student print their checksheet
        $scope.printchecksheet = function() {
            

            var pdf = new jsPDF('l', 'pt', 'a4');
            var options = {
                pagesplit: true
            };
            //Target the div that contains student's checkhseet
            //Debug: Print blurry image. This can be done better
            pdf.addHTML($('#studentchecksheetdiv'), 0, 0, options, function() {
                pdf.save("mychecksheet.pdf");
            });

        }

        //Default divshow to let student pick one of their checksheet's first
        $scope.divshow = '0';
        //When student pick their checksheet
        $scope.setdivshowtrue = function(val) {
            //Instantiate local values such as checksheet that is being viewed
            $scope.checksheetinview = $scope.checksheets[val];
            $scope.checksheetinviewindex = val;
            $scope.checksheetdata = $scope.student.checksheetdata[$scope.checksheetinviewindex];
            $scope.divshow = '1';
            //This is for checksheet summary
            $scope.complete = 0;
            $scope.incomplete = 0;
            $scope.blocksummarycomplete = new Array($scope.checksheetdata.length);
            for (i = 0; i < $scope.blocksummarycomplete.length; i++) {
                $scope.blocksummarycomplete[i] = 0;
            }
            $scope.blocksummaryincomplete = new Array($scope.checksheetdata.length);
            for (i = 0; i < $scope.blocksummaryincomplete.length; i++) {
                $scope.blocksummaryincomplete[i] = 0;
            }
            //For checksheet summary
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

        //Called in view
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


    }
]);



// Student controller that handles modification of student checksheet
angular.module('smApp').controller('studentmodifychecksheetcontroller', ['$scope', 'notificationFactory', 'AuthService', '$http', '$uibModal', '$confirm',
    function($scope, notificationFactory, AuthService, $http, $uibModal, $confirm) {

        $scope.submitcounter = 0;

        //Watch for changes in block description
        //Debug: This is what's needed in other places
        $scope.$watch('templateURL', function(newVal, oldVal) {

            if (oldVal == "partials/studentmodifychecksheet.html" && newVal != "partials/studentmodifychecksheet.html" && $scope.divshow == '1' && $scope.submitcounter == '0') {
                $confirm({
                        text: 'You are about to go to a different tab. Did you want to save the changes on your checksheet?',
                        title: 'Save changes to checksheet',
                        ok: 'Save changes',
                        cancel: 'No'
                    })
                    .then(function() {
                        $scope.submitchecksheetdata();
                    });
            }

        });




        $scope.divshow = '0';
        //Show checksheet
        $scope.setdivshowtrue = function(val) {
            $scope.checksheetinview = $scope.checksheets[val];
            $scope.checksheetinviewindex = val;
            $scope.checksheetdata = $scope.student.checksheetdata[$scope.checksheetinviewindex];
            $scope.divshow = '1';

        }

        //Function is called from view
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

        //Submit checkhseet data modifications
        $scope.submitchecksheetdata = function() {
          //Set counter to 1 so that save changes nag is disabled
            $scope.submitcounter = 1;
            //Loop converts local data structure to data strucutre that is suitable for data storage
            for (i = 0; i < $scope.checksheetdata.length; i++) {
                for (j = 0; j < $scope.checksheetdata[i].length; j++) {
                    if (!angular.isUndefinedOrNull($scope.checksheetdata[i][j])) {
                        if ($scope.checksheetdata[i][j].manual) {
                            for (k = 0; k < $scope.courses.length; k++) {
                                if (($scope.checksheetdata[i][j].prefix == $scope.courses[k].prefix) && ($scope.checksheetdata[i][j].suffix == $scope.courses[k].suffix)) {
                                    delete $scope.checksheetdata[i][j].manual;
                                    break;
                                }
                            } // for  k loop end

                        } //if statement
                    } //outer if
                } //for j
            } //for i 
     
            //HTTP request to post modified checksheet data to database
            $http({
                    method: 'POST',
                    url: '/checksheetdata',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        _id: AuthService.getuserid(),
                        checksheetinviewindex: $scope.checksheetinviewindex,
                        checksheetdata: $scope.checksheetdata
                    }

                }).success(function(data, status, headers, config) {
                    //Updating pice chart data on student summary page
                    $scope.yourdata[0].y = 0;
                    $scope.yourdata[1].y = $scope.checksheets[0].credits;
                    for (i = 0; i < $scope.student.checksheetdata[0].length; i++) {
                        for (j = 0; j < $scope.student.checksheetdata[0][i].length; j++) {
                            if (!angular.isUndefinedOrNull($scope.student.checksheetdata[0][i][j])) {
                                if (!angular.isUndefinedOrNull($scope.student.checksheetdata[0][i][j].suffix)) {
                                    if (!angular.isUndefinedOrNull($scope.student.checksheetdata[0][i][j].credits)) {
                                        $scope.yourdata[0].y = $scope.yourdata[0].y + $scope.student.checksheetdata[0][i][j].credits;
                                        $scope.yourdata[1].y = $scope.yourdata[1].y - $scope.student.checksheetdata[0][i][j].credits;
                                    } else {
                                        $scope.yourdata[0].y = $scope.yourdata[0].y + 3;
                                        $scope.yourdata[1].y = $scope.yourdata[1].y - 3;
                                    }
                                }
                            }
                        }
                    }

                    notificationFactory.success("Checksheetdata updated!");
                    //Go back to home page
                    $scope.settemplateURL("partials/studentsummary.html");

                })
                .error(function(data, status, headers, config) {
                    notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
                });

        }

        //Reset slot details
        $scope.deleteSlotDetails = function(pid, id) {
            $scope.checksheetdata[pid][id] = null;
            $scope.checksheetdata[pid][id] = {};

        }



        //Create modal to let user view their slot's info
        $scope.viewSlotInfo = function(pid, id) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/viewSlotInfo.html',
                controller: 'viewSlotInfoController',
                scope: $scope,
                size: 'lg',
                resolve: {
                    pid: function() {
                        return pid;
                    },
                    id: function() {
                        return id;
                    }
                }
            });

        }

        //Create modal to let user modify their slot
        $scope.modifySlot = function(pid, id) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/studentmodifySlot.html',
                controller: 'modifyslotController',
                scope: $scope,
                size: 'lg',
                resolve: {
                    pid: function() {
                        return pid;
                    },
                    id: function() {
                        return id;
                    }
                }
            });


        };

        //Add not on a slot through a modal
        $scope.addSlotNote = function(pid, id) {
         
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/studentmodifyslotnote.html',
                controller: 'slotnoteController',
                scope: $scope,
                resolve: {
                    pid: function() {
                        return pid;
                    },
                    id: function() {
                        return id;
                    }
                }
            });


        };
    }
]);


// Student controller that handles modification of student settings
angular.module('smApp').controller('studentsettingscontroller', ['$scope', '$location', 'notificationFactory', 'AuthService', '$http',
    function($scope, $location, notificationFactory, AuthService, $http) {
        //Instantiate setting to hold new user settings
        $scope.setting = {};
        //Update current setting, communicatie with the database
        $scope.updatestudentsettings = function() {
            $scope.setting._id = $scope.student_id;
            $scope.setting.password = $scope.studentnewpassword;
            //Debug: Set registered to true. This flag is important.
            $scope.setting.registered = true;
            $http({
                    method: 'PUT',
                    url: '/studentsetting',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        setting: $scope.setting
                    }
                }).success(function(data, status, headers, config) {
                    notificationFactory.success("Settings update succesfully.");
                    $scope.student.registered = "true"
                    $scope.settemplateURL("partials/studentsummary.html");

                })
                .error(function(data, status, headers, config) {
                    notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
                });
        }

    }
]);