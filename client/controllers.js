angular.module('smApp').controller('loginController',
  ['$scope', '$location', 'AuthService',
  function ($scope, $location, AuthService) {

}]);

angular.module('smApp').controller('ApplicationController', function ($scope,
                                               USER_ROLES,
                                               AuthService) {

  };
})

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
