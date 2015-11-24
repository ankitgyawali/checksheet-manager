var smApp = angular.module('smApp', ['ngRoute','ngCookies']);



smApp.config(function ($routeProvider) {
  $routeProvider
    .when('/', {templateUrl: 'partials/login.html', controller:'loginController'})

    
    .when('/dashboard', {
      templateUrl: 'partials/dashboard.html'
    })
     .when('/login', {
      templateUrl: 'partials/login.html',
      controller: 'loginController'
    })

      // use the HTML5 History API
      // $locationProvider.html5Mode(true);
});

smApp.filter('firstCapitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});