//Main login controller that handles login of three different user types
angular.module('smApp').controller('loginController', ['$scope', '$location', 'notificationFactory', 'AuthService', '$timeout',
    function($scope, $location, notificationFactory, AuthService, $timeout) {

        //Check if usertype has been set
        console.log("if auth get usertype: " + AuthService.getusertype());

        if (AuthService.getusertype() == undefined || AuthService.getusertype() == '') {
        //If usertype has not been set already set it to student so that student login is showed by default
        console.log("not defined so student");
        AuthService.setusertype('student');
        }
        //Finally get usertype from factory
        $scope.userType = AuthService.getusertype()
        //Set user local function that can be accessed in view
        $scope.setUser = function(val) {

            AuthService.setusertype(val);
            $scope.userType = AuthService.getusertype();

            $timeout(function() {
                console.log('setUser Auth from controler: ' + AuthService.getusertype())
            }, 100);

        }
        //Submit function that passes email password and usertype to factory so that it can be 
        //authenticated thre
        $scope.submit = function() {
            var x = AuthService.login($scope.Email, $scope.Password, $scope.userType)
                .then(function() {
                    //Setlocation url according to type of user that is logged in
                    //This url is locked via app.config in main.js
                    //The url point to dashboard type and provides necessary access controls
                    if (AuthService.isLoggedIn()) {
                        if (AuthService.getusertype() == "root") {
                            $location.url('/root/dashboard');
                        } else if (AuthService.getusertype() == "student") {
                            $location.url('/student/dashboard');
                        } else if (AuthService.getusertype() == "advisor") {
                            $location.url('/advisor/dashboard');
                        } else {
                            $location.url('/login');
                        }
                        notificationFactory.success('Logged in as ' + AuthService.getusername());

                    }

                })
                // Hangles authentication error
                .catch(function() {
                    notificationFactory.error('Invalid username & password combination');

                });


        };


    }
]);




// Student controller that handles student dashboard and student operation
angular.module('smApp').controller('studentController',
  ['$scope', '$location', 'notificationFactory', 'AuthService','$http', 
   function ($scope, $location, notificationFactory, AuthService,$http) {

      //Instantiates templateURL for dashboard constant at parent scope so subsequent child
        //controllers can modify it
        $scope.templateURL = 'partials/studentsummary.html';
        // $scope.templateURL = 'partials/student.html';
        //Get username and type at parent scope
        $scope.username = AuthService.getusername();
        $scope.usertype = AuthService.getusertype();
        $scope.student_id =  AuthService.getuserid();
        //Method to modify templateURL 
        $scope.settemplateURL = function(temp) {
            $scope.templateURL = temp;
        };



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
                        $scope.advisors = data.advisor;
                        $scope.checksheets = data.checksheet;
                
                  
                        if(!$scope.student.registered){
                            notificationFactory.warning("First time login detected. Change your password and choose presonal settings to proceed.");
                            $scope.templateURL = "partials/studentsettings.html"
                        }
                        else{
                             $scope.templateURL = "partials/studentsummary.html"
                        }
                    })
                    .error(function(data, status, headers, config) {
                        notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
                    });



         $http({
                        method: 'GET',
                        url: '/classes'

                    }).success(function(data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                        $scope.dpts = data.dpts;
                        $scope.courses = data.courses;

                        //console.log(JSON.stringify($scope.courses | suffix:135));

                    })
                    .error(function(data, status, headers, config) {
                        notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
                    });


         $scope.$watch('templateURL', function(val) {
            if($scope.student){
               if(!$scope.student.registered){
                if($scope.templateURL != "partials/studentsettings.html")
                {
                notificationFactory.warning("Change your settings to proceed.");
                }
                            $scope.templateURL = "partials/studentsettings.html"
                        }
                        else{
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



}]);




// Student controller that handles student dashboard and student operation
angular.module('smApp').controller('studentsettingscontroller',
  ['$scope', '$location', 'notificationFactory', 'AuthService','$http', 
   function ($scope, $location, notificationFactory, AuthService,$http) {
    $scope.setting = {};
    $scope.updatestudentsettings = function () {
        $scope.setting._id = $scope.student_id;
        $scope.setting.password = $scope.studentnewpassword;
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

}]);
