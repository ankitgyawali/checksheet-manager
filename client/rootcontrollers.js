//Main Root Controller that handles root dashboard
angular.module('smApp').controller('rootController', ['$scope', '$location', 'notificationFactory', 'AuthService', '$cookies',
    function($scope, $location, notificationFactory, AuthService, $cookies) {

        //Instantiates templateURL for dashboard constant at parent scope so subsequent child
        //controllers can modify it
        // $scope.templateURL = 'partials/rdept.html';
        $scope.templateURL = 'partials/radvisor.html';
        //Get username and type at parent scope
        $scope.username = AuthService.getusername();
        $scope.usertype = AuthService.getusertype();
        //Method to modify templateURL 
        $scope.settemplateURL = function(temp) {
            $scope.templateURL = temp;
        };

        //Logout function that utilizes factory service 
        $scope.logout = function() {
            AuthService.logout();
            notificationFactory.info("Logged out succesfully!")
            $location.url('/login');
        };

    }
]);

//Controller that handles "manage advisor" dashboard page
angular.module('smApp').controller('rootadvisorController', ['$scope', '$location', 'notificationFactory', '$uibModal', '$http', 'AuthService',
    function($scope, $location, notificationFactory, $uibModal, $http, AuthService) {

        //Watches template URL to get necessary data for dashboard
        $scope.$watch('templateURL', function(val) {
            if (val == "partials/rootregisteradvisor.html") {
                //Get department names for the form
                $http({
                        method: 'GET',
                        url: '/departmentnames'

                    }).success(function(data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                        $scope.dpts = data;
                  

                    })
                    .error(function(data, status, headers, config) {
                        notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
                    });
            } else { //Get advisor list to show advisor data
                $http({
                        method: 'GET',
                        url: '/advisors'

                    }).success(function(data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                        $scope.advisors = data;


                    })
                    .error(function(data, status, headers, config) {
                        notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")

                    });
            };

        });




        $scope.pageSize = AuthService.getPaginationSize();
        $scope.currentPage = 1;
        //Watches pagesize to store value in factory
        $scope.$watch('pageSize', function(val) {

            AuthService.setPaginationSize(val);
        });
        //Number of advisors to add instantiated to 1
        $scope.numtoadd = 1;
        //Array which holds new data of advisors to add
        $scope.arraytoAdd = [];
        //Function to instantiate array to add from ng-repeat
        $scope.newAdvisors = function(num) {
            return new Array(num);
        }
        //Watch numtoadd to make changes to array to add length
        $scope.$watch('numtoadd', function(val) {
            $scope.arraytoAdd.length = val;
        });
        //Function that is used in the view via ng-click to access factory function
        $scope.generatepwd = function() {
            return AuthService.generatePassword();
        }
        //Delete advisor from the backend using restful api
        $scope.deleteadvisor = function(advisor) {
            console.log(advisor._id);
            $http({
                    method: 'DELETE',
                    url: '/advisors',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        deleteID: advisor._id
                    }

                }).success(function(data, status, headers, config) {
                    //Advisor array held on clients local memory is spliced once advisor 
                    //has been deleted from backend so that necessary changes is reflected in view
                    $scope.advisors.splice($scope.advisors.indexOf(advisor), 1);
                    notificationFactory.info("Successfully deleted the advisor");


                })
                .error(function(data, status, headers, config) {

                    notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")
                });


        };
        //Delete number of advisor to add
        $scope.delnewAdvisor = function(index) {
            $scope.numtoadd = $scope.numtoadd - 1;
            $scope.arraytoAdd.splice(index, 1);
        };

        //Add new advisors to the backend after it has been submitted
        $scope.addAdvisors = function() {
            $http({
                    method: 'POST',
                    url: '/advisors',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        arraytoAdd: $scope.arraytoAdd
                    }

                }).success(function(data, status, headers, config) {
                 //Template will be set to show new advisors once addadvisor has been completed
                $scope.settemplateURL('partials/radvisor.html');
               notificationFactory.info("Successfully added advisors! ");
                })
                .error(function(data, status, headers, config) {
                    notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")

                });
        }
    }
]);

//Controllers that handles manage department at root dashboard
angular.module('smApp').controller('rootDeptController', ['$scope', '$location', 'notificationFactory', '$uibModal', '$http', 'AuthService',
    function($scope, $location, notificationFactory, $uibModal, $http, AuthService) {
        //Load necessary data according to the template that has been looaded
        if ($scope.templateURL == "partials/rdept.html") {
            //GET department info is department is to be viewed and store it on scope.departments
            $http({
                    method: 'GET',
                    url: '/departments'

                }).success(function(data, status, headers, config) {
                    // this callback will be called asynchronously
                    // when the response is available
                    $scope.departments = data;

                })
                .error(function(data, status, headers, config) {
                    console.log(" Not Doneee " + status + data + headers + config);

                });

        }
        $scope.currentPage = 1;
        $scope.pageSize = AuthService.getPaginationSize();
        //Watch for pagesize change to update factory
        $scope.$watch('pageSize', function(val) {

            AuthService.setPaginationSize(val);
        });
        //Watch for numtoadd to update number of advisors to add table
        $scope.numtoadd = 1;
        $scope.$watch('numtoadd', function(val) {

            $scope.arraytoAdd.length = val;

        });
        //Local array where new information regarding department is helf
        $scope.arraytoAdd = [];
        //Function to be called by ng repeat
        $scope.newDepts = function(num) {

                return new Array(num);
            }

        //** Debug code - This might be needed
        // $scope.newDeptsprimitive = $scope.newDepts;

        //Delete new departments table
        $scope.delnewDepts = function(index) {
            $scope.numtoadd = $scope.numtoadd - 1;
            $scope.arraytoAdd.splice(index, 1);
        }
        //Add new department to the back end once the data has been submitted
        $scope.addDepts = function() {
            console.log("array is: " + $scope.arraytoAdd + 'or' + JSON.stringify($scope.arraytoAdd));
            $http({
                    method: 'POST',
                    url: '/departments',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        arraytoAdd: $scope.arraytoAdd
                    }

                }).success(function(data, status, headers, config) {
                //Set template to revert back to displaying department so that user can view/update newly added department
                $scope.settemplateURL('partials/rdept.html');
                notificationFactory.info("Successfully added departments: ");

                })
                .error(function(data, status, headers, config) {
                    console.log(" Not Doneee " + status + data + headers + config);
                    notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")

                });

        }

        //Use angularUI bootstrap module to instiate a modal so user can modify a department
        //This modal contains its own controller and templateURL. depID - the department to update
        //is passed to this modal as argument
        $scope.modifyDept = function(depID) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/deptModal.html',
                controller: 'deptModalController',
                scope: $scope,
                resolve: {
                    depID: function() {
                        return depID;
                    }
                }
            });


        };

    }
]);

// Controller for root users to manage other root user
angular.module('smApp').controller('rootmanagerController',
  ['$scope', '$location', 'notificationFactory','$uibModal', '$http','AuthService',
   function ($scope, $location, notificationFactory,$uibModal,$http, AuthService) {

//Get root user data if default root page is loaded
if($scope.templateURL=="partials/newrootuser.html"){
   $http({
            method: 'GET',
            url: '/roots'

        }).success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
             $scope.roots = data;


        })
        .error(function(data, status, headers, config) {
             console.log(" Not Doneee "+ status+data+headers+config);


        });
      }
 
 //Set default pagination page number to 1
 $scope.currentPage = 1;
 $scope.pageSize = AuthService.getPaginationSize();

//Watch page size changes to set it safely in service so that value doesnt change on controller refresh
$scope.$watch('pageSize', function(val) {

  AuthService.setPaginationSize(val);
   });

//Declare root user json to bind to view data 
$scope.newroot = {};

//Set newroot users registered status to false by default so that they will be prompted
// for password change on login
$scope.newroot.registered = "false";
  $scope.generatepwd = function (){
  $scope.newroot.password = AuthService.generatePassword();
 };


//Delete root user from database
 $scope.deleteroot = function(root)
 {
  $http({
            method: 'DELETE',
            url: '/roots',
            // set the headers so angular passing info as form data (not request payload)
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                deleteID: root._id
            }

        }).success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
               $scope.roots.splice($scope.roots.indexOf(root),1);

       $scope.settemplateURL('partials/newrootuser.html');    
      notificationFactory.info("Successfully deleted: "+root.firstname)
   

        })
        .error(function(data, status, headers, config) {
          $scope.settemplateURL('partials/newrootuser.html');    
        notificationFactory.error("Error: Status Code "+status+". Contact admin if issue persists.")
        });

 }

//Add root user to database
 $scope.addRoots = function (){

  $http({
            method: 'POST',
            url: '/roots',
            // set the headers so angular passing info as form data (not request payload)
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                arraytoAdd: $scope.newroot
            }

        }).success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
  
             $scope.settemplateURL('partials/newrootuser.html');
            notificationFactory.info("Successfully added and emailed the root user! ");

        })
        .error(function(data, status, headers, config) {
             console.log(" Not Doneee "+ status+data+headers+config);
                 notificationFactory.error("Error: Status Code "+status+". Contact admin if issue persists.")
      
        });

 };

}]);


//Option for root user to perform parts of crud operation on class database
angular.module('smApp').controller('rootClassController',
  ['$scope', 'notificationFactory','$uibModal', '$http','AuthService',
   function ($scope, notificationFactory,$uibModal,$http, AuthService) {


    //Get classes on controller load to display information
     $http({
            method: 'GET',
            url: '/classes'

        }).success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
             $scope.courses = data.courses;
             $scope.dpts = data.dpts;
              console.log("classes");
        })
        .error(function(data, status, headers, config) {
             console.log(" Not Doneee "+ status+data+headers+config);


        });
 
 //Default current page set for pagination
 $scope.currentPage = 1;
  $scope.pageSize = AuthService.getPaginationSize();

$scope.$watch('pageSize', function(val) {

  AuthService.setPaginationSize(val);
   });

//Set number of classes to add in view  by 1 as default
 $scope.numtoadd = 1;

 //Watch number of classes to add and make changes to array 
 $scope.$watch('numtoadd', function(val) {
$scope.classestoAdd.length = val;
});


//Initialize array to add classes
 $scope.classestoAdd = [];

//Create new array according to number of classes to add
$scope.newClasses = function(num) {
    return new Array(num);
}

$scope.newClassesprimitive = $scope.newClasses;

//Set class prefix on the array
$scope.setClassprefix = function(prefix,index){
  $scope.classestoAdd[index].prefix = prefix;
}

//Delete classes from the array
$scope.delnewClasses = function(index) {
  $scope.numtoadd = $scope.numtoadd - 1;
   $scope.classestoAdd.splice(index,1);
}

// Add classes to the database on submit
$scope.addClasses = function() {
     $http({
            method: 'POST',
            url: '/classes',
            // set the headers so angular passing info as form data (not request payload)
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                arraytoAdd: $scope.classestoAdd
            }

        }).success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
  
             $scope.settemplateURL('partials/rclass.html');
            notificationFactory.info("Successfully added classes. ");

        })
        .error(function(data, status, headers, config) {
             console.log(" Not Doneee "+ status+data+headers+config);
                 notificationFactory.error("Error: Status Code "+status+". Contact admin if issue persists.")
      
        });
    
}

//Function to make modification to class, opens a new modal with new controller
 $scope.modifyclass = function (course){

 var modalInstance = $uibModal.open({
      templateUrl: 'partials/classModal.html',
      controller: 'classModalController',
      scope: $scope,
      resolve: {
        course: function () {
          return course;
        }
      }
    });

};

}]);

//Controller for modal box to modify class
angular.module('smApp').controller('classModalController',
  ['$scope', '$filter','$uibModalInstance', 'course', '$http', 'notificationFactory', '$location',
    function ($scope,$filter,$uibModalInstance, course,$http,notificationFactory,$location) {

//Deep copy for class
$scope.classID = angular.copy(course);

//Copy default names, department, prefix so that the binded data won't be affected
$scope.className = $scope.classID.name;
$scope.classDep = $scope.classID.department;
$scope.classprefix = $scope.classID.prefix;

//Set prefix on database
$scope.setprefix = function(prefix){
  $scope.classID.prefix = prefix;
}

//Function to cancel modal
$scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

//Delete classes from database
$scope.delete = function () {
    $http({
            method: 'DELETE',
            url: '/classes',
            // set the headers so angular passing info as form data (not request payload)
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                deleteID: course._id
            }

        }).success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            console.log("deleted: "+course._id);
            $uibModalInstance.dismiss('cancel');
            //$location.url('/root/dashboard');
            
             if (status === 200) {
       
     $scope.courses.splice($scope.courses.indexOf(course),1);
      notificationFactory.info("Successfully deleted: "+$scope.classID.name)
            }

        })
        .error(function(data, status, headers, config) {

        $uibModalInstance.dismiss('cancel');
        notificationFactory.error("Error: Status Code "+status+". Contact admin if issue persists.")
        });


  };


//Modify classes on the database
$scope.modify = function () {
 // create a new instance of deferred
    $http({
            method: 'PUT',
            url: '/classes',
            // set the headers so angular passing info as form data (not request payload)
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                classID: $scope.classID
            }

        }).success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            $uibModalInstance.dismiss('cancel');
            //$location.url('/root/dashboard');
            
             if (status === 200) {
                angular.copy($scope.classID,course);

               notificationFactory.info("Successfully updated: "+$scope.classID.name)
            }

        })
        .error(function(data, status, headers, config) {

        $uibModalInstance.dismiss('cancel');
        notificationFactory.error("Error: Status Code "+status+". Contact admin if issue persists.")
        });



  };

}]);

//Controller for modal to modify department
angular.module('smApp').controller('deptModalController',
  ['$scope', '$filter','$uibModalInstance', 'depID', '$http', 'notificationFactory', '$location',
    function ($scope,$filter,$uibModalInstance, depID,$http,notificationFactory,$location) {

//Deep copy of department object. This is because angular assigns stuff by reference by default
$scope.newID = angular.copy(depID);
$scope.depName = $scope.newID.name;

//Cancel modal for department
$scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

//Delete department from database
$scope.delete = function () {
    $http({
            method: 'DELETE',
            url: '/departments',
            // set the headers so angular passing info as form data (not request payload)
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                deleteID: depID._id
            }

        }).success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            console.log("deleted: "+depID._id);
            $uibModalInstance.dismiss('cancel');
            //$location.url('/root/dashboard');
            
             if (status === 200) {
              console.log($scope.departments[0].name);
     $scope.departments.splice($scope.departments.indexOf(depID),1);
      notificationFactory.info("Successfully deleted: "+$scope.newID.name)
            }

        })
        .error(function(data, status, headers, config) {

        $uibModalInstance.dismiss('cancel');
        notificationFactory.error("Error: Status Code "+status+". Contact admin if issue persists.")
        });


  };


// Modify department information on the database
$scope.modify = function () {
 // create a new instance of deferred
    $http({
            method: 'PUT',
            url: '/departments',
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
                angular.copy($scope.newID,depID);

               notificationFactory.info("Successfully updated: "+$scope.newID.name)
            }

        })
        .error(function(data, status, headers, config) {

        $uibModalInstance.dismiss('cancel');
        notificationFactory.error("Error: Status Code "+status+". Contact admin if issue persists.")
        });
  };

}]);


