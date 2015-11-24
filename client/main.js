var smApp = angular.module('smApp', ['ngRoute']);

smApp.config(function ($routeProvider) {
  $routeProvider
    .when('/', {templateUrl: 'partials/student.html'})

    .when('/advisor', {
      templateUrl: 

      'partials/advisor.html'
    })
    .when('/root', {
      templateUrl: 'partials/root.html'
    })
    .when('/student', {
      templateUrl: 'partials/student.html'
    })
    .when('/dashboard', {
      templateUrl: 'partials/dashboard.html'
    })


      // use the HTML5 History API
      // $locationProvider.html5Mode(true);
});

smApp.run(['$rootScope', '$location', 'AuthService', function ($rootScope, $location, AuthService) {
    $rootScope.$on('$routeChangeStart', function (event) {

        if (!AuthService.isLoggedIn()) {
            console.log('DENY');
            console.log($location.path());
            event.preventDefault();
            //$location.path('/student');
            $location.url('/advisor');

        }
        else {
            console.log('ALLOW');
            $location.path('/dashboard');
        }
    });
}]);