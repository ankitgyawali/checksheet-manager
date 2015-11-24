angular.module('smApp').controller('loginController',
  ['$scope', '$location', 'notificationFactory','AuthService', 
   function ($scope, $location,notificationFactory,AuthService) {
   
     if(AuthService.getusertype()==''){
      AuthService.setusertype('student');
      $scope.userType = AuthService.getusertype();
    }

    $scope.setUser = function(val) {
    AuthService.setusertype(val);
    $scope.userType = AuthService.getusertype();
  } 
   $scope.userType = AuthService.getusertype();
  

     $scope.submit = function (){
     console.log('----->'+$scope.rEmail);
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
  ['$scope', '$location', 'notificationFactory','AuthService',
   function ($scope, $location,notificationFactory,AuthService ) {
$scope.username =  AuthService.getusername();
}]);


angular.module('smApp').controller('rootloginController',
  ['$scope', '$location', 'notificationFactory', 'AuthService', 
   function ($scope, $location, notificationFactory, AuthService) {

    



}]);
