angular.module('smApp').controller('loginController',
  ['$scope', '$location', 'AuthService',
  function ($scope, $location, AuthService) {

}]);

angular.module('smApp').controller('dashboardController',
  ['$scope', '$location', 'notificationFactory',
   function ($scope, $location,notificationFactory ) {

}]);


angular.module('smApp').controller('rootloginController',
  ['$scope', '$location', 'notificationFactory', 'AuthService', 
   function ($scope, $location, notificationFactory, AuthService) {


      $scope.submit = function (){

      var rootEmail = $scope.rEmail;
      var rootPassword = $scope.rPassword;
     // AuthService.login($scope.rEmail,$scope.rootPassword,'root')
     // console.log('auth userType: '+AuthService.getusertype());
     // console.log('auth userName: '+ AuthService.getusername());


      if (rootEmail=='aa' && rootPassword=='aa')
      {
        $location.url('/dashboard')
        notificationFactory.success('Logged in as ' + rootEmail);      }
      else
      {
        //ngNotifier.notifyError($scope.rEmail);
        notificationFactory.error('Invalid username & password combination');
      }
    };


}]);
