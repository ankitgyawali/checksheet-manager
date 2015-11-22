

angular.module('smApp').controller('menuController',
  ['$scope', '$location', 'AuthService',  '$timeout',

   function ($scope, $location, AuthService, $timeout) {
    $scope.setUser = function(val) {
      
    AuthService.setusertype(val);
     console.log('xx '+AuthService.getusertype());
  }


}]);


angular.module('smApp').controller('loginController',
  ['$scope', '$location', 'notificationFactory','AuthService', 
   function ($scope, $location,notificationFactory,AuthService) {
   
     $scope.userType = 'root';
   console.log('aaax '+AuthService.getusertype())
    $scope.userType = AuthService.getusertype();
     console.log('Ox '+$scope.userType);
     
      
$scope.$apply()

}]);



angular.module('smApp').controller('dashboardController',
  ['$scope', '$location', 'notificationFactory','AuthService',
   function ($scope, $location,notificationFactory,AuthService ) {
$scope.username =  AuthService.getusername();
}]);


angular.module('smApp').controller('rootloginController',
  ['$scope', '$location', 'notificationFactory', 'AuthService', 
   function ($scope, $location, notificationFactory, AuthService) {

      $scope.submit = function (){

      var x = AuthService.login($scope.rEmail,$scope.rPassword,'root')
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
