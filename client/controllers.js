angular.module('smApp').controller('loginController',
  ['$scope', '$location', 'AuthService',
  function ($scope, $location, AuthService) {

}]);

angular.module('smApp').controller('dashboardController',
  ['$scope', '$location', 'notificationFactory',
   function ($scope, $location,notificationFactory ) {



}]);


angular.module('smApp').controller('rootloginController',
  ['$scope', '$location', 'notificationFactory',
   function ($scope, $location,notificationFactory ) {


    $scope.submit = function (){
      var rootEmail = $scope.rEmail;
      var rootPassword = $scope.rPassword;
      console.log(rootPassword);
      console.log(rootEmail);

      $scope.pop = function(){
            toaster.pop('success', "title", "text");
        };

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
