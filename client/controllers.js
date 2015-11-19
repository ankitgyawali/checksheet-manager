angular.module('smApp').controller('loginController',
  ['$scope', '$location', 'AuthService',
  function ($scope, $location, AuthService) {

}]);

angular.module('smApp').controller('dashboardController',
  ['$scope', '$location', 'notificationFactory',
   function ($scope, $location,notificationFactory ) {

}]);


angular.module('smApp').controller('rootloginController',
  ['$scope', '$location', '$http', 'notificationFactory', 
   function ($scope, $location,$http, notificationFactory ) {


    $scope.submit = function (){
      var rootEmail = $scope.rEmail;
      var rootPassword = $scope.rPassword;
       console.log('username: '+rootEmail);
      console.log('password: '+rootPassword);
  
     $http({
  method  : 'POST',
  url     : '/root',
    // set the headers so angular passing info as form data (not request payload)
  headers : { 'Content-Type': 'application/json' },
  data    :  {
              type:'root',
              username:$scope.rEmail,
              password:$scope.rPassword
            }

 }).then(function (response) {
console.log('Res response '+response.msg);
 });
  console.log('Res http'+$http.msg);
     console.log('Res scope'+$scope.msg);

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
