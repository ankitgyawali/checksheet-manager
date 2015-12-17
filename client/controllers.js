angular.module('smApp').controller('loginController',
  ['$scope', '$location', 'notificationFactory','AuthService', '$timeout',
   function ($scope, $location,notificationFactory,AuthService,$timeout) {


console.log("if auth get usertype: " +AuthService.getusertype());

       if(AuthService.getusertype()== undefined || AuthService.getusertype()=='' ){

        console.log("not defined so student");
      AuthService.setusertype('student');

    }

 $scope.userType = AuthService.getusertype()

   

    $scope.setUser = function(val) {
     
    AuthService.setusertype(val);
    $scope.userType = AuthService.getusertype();

      $timeout(function() {
     console.log('setUser Auth from controler: '+AuthService.getusertype())
    }, 100);
  
  } 

  console.log(AuthService.getusertype());

     $scope.submit = function (){
      var x = AuthService.login($scope.Email,$scope.Password,$scope.userType)
       .then(function () {
        if (AuthService.isLoggedIn())
        {

       if (AuthService.getusertype() == "root")
                 {

                          $location.url('/root/dashboard');
                       }
                      else if (AuthService.getusertype() == "student")
                      {
                         $location.url('/student/dashboard');
                      }
                      else if (AuthService.getusertype() == "advisor")
                      {
                           $location.url('/advisor/dashboard');
                      }
                      else
                      {
                           $location.url('/login');
                      }
        notificationFactory.success('Logged in as ' + AuthService.getusername());  
        
        }
   
     })
        // handle error
       .catch(function () {
        notificationFactory.error('Invalid username & password combination');
        
        });

     
        };


}]);



angular.module('smApp').controller('dashboardController',
  ['$scope', '$location', 'notificationFactory', 'AuthService','$cookies', 
   function ($scope, $location, notificationFactory, AuthService,$cookies) {


      console.log("dashboard check: "+AuthService.isLoggedIn());
       $scope.username = AuthService.getusername();
       $scope.usertype = AuthService.getusertype();
       $scope.lol = $cookies.get('loggedin');

    $scope.logout = function (){
    AuthService.logout();
    notificationFactory.info("Logged out succesfully!")
    $location.url('/login');
     };



}]);


angular.module('smApp').controller('rootController',
  ['$scope', '$location', 'notificationFactory', 'AuthService','$cookies', 
   function ($scope, $location, notificationFactory, AuthService,$cookies) {



       $scope.username = AuthService.getusername();
       $scope.usertype = AuthService.getusertype();
       $scope.lol = $cookies.get('loggedin');

    $scope.logout = function (){
    AuthService.logout();
    notificationFactory.info("Logged out succesfully!")
    $location.url('/login');
     };



}]);



angular.module('smApp').controller('advisorController',
  ['$scope', '$location', 'notificationFactory', 'AuthService','$cookies', 
   function ($scope, $location, notificationFactory, AuthService,$cookies) {


      console.log("dashboard check: "+AuthService.isLoggedIn());
       $scope.username = AuthService.getusername();
       $scope.usertype = AuthService.getusertype();
       $scope.lol = $cookies.get('loggedin');

    $scope.logout = function (){
    AuthService.logout();
    notificationFactory.info("Logged out succesfully!")
    $location.url('/login');
     };



}]);



angular.module('smApp').controller('studentController',
  ['$scope', '$location', 'notificationFactory', 'AuthService','$cookies', 
   function ($scope, $location, notificationFactory, AuthService,$cookies) {


      console.log("dashboard check: "+AuthService.isLoggedIn());
       $scope.username = AuthService.getusername();
       $scope.usertype = AuthService.getusertype();
       $scope.lol = $cookies.get('loggedin');

    $scope.logout = function (){
    AuthService.logout();
    notificationFactory.info("Logged out succesfully!")
    $location.url('/login');
     };



}]);