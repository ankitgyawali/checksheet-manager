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
    


      // use the HTML5 History API
      // $locationProvider.html5Mode(true);
});

