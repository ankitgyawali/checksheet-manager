angular.module('smApp').controller('loginController',
  ['$scope', '$location', 'notificationFactory','AuthService', 
   function ($scope, $location,notificationFactory,AuthService) {

     if(AuthService.getusertype()== undefined){
      AuthService.setusertype('student');
      $scope.userType = AuthService.getusertype();
    }

    $scope.setUser = function(val) {
    AuthService.setusertype(val);
    $scope.userType = AuthService.getusertype();
  } 
   $scope.userType = AuthService.getusertype();
  

     $scope.submit = function (){
      var x = AuthService.login($scope.Email,$scope.Password,$scope.userType)
       .then(function () {
        if (AuthService.isLoggedIn())
        {
        $location.url('/dashboard');
        notificationFactory.success('Logged in as ' + AuthService.getusername());  
        }
   
     })
        // handle error
       .catch(function () {
        console.log('authNOPEW');
        notificationFactory.error('Invalid username & password combination');
        
        });
      // Never gets invoked
   
        //doesnt reach here if not logged

      console.log('logged or not: '+AuthService.isLoggedIn());     
        };


}]);



angular.module('smApp').controller('dashboardController',
  ['$scope', '$location', 'notificationFactory', 'AuthService', 
   function ($scope, $location, notificationFactory, AuthService) {
      $scope.username =  AuthService.getusername();
    $scope.logout = function (){
        console.log('Hallo');
         console.log('logged or not: '+AuthService.isLoggedIn());
       AuthService.logout();
          $location.url('/login');
      // $location.url('/student');
     };



}]);
