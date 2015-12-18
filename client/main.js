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
      .when('/root/dashboard', {
      templateUrl: 'partials/root.html',
      controller: 'rootController'
    })
       .when('/student/dashboard', {
      templateUrl: 'partials/student.html',
      controller: 'studentController'
    })
        .when('/advisor/dashboard', {
      templateUrl: 'partials/advisor.html',
      controller: 'advisorController'
    })

      // use the HTML5 History API
      // $locationProvider.html5Mode(true);
});



smApp.filter('firstCapitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});


smApp.run(['$rootScope', '$location', 'AuthService', 
  function ($rootScope, $location, AuthService) {


      if (AuthService.isLoggedIn() == "true") {
                if (AuthService.getusertype() == "root")
                       {
                          $location.url('/root/dashboard');
                       }
                      else if (AuthService.getusertype() == "student")
                      {
                         $location.url('/student/dashboard');
                      }
                      else if (AuthService.getusertype() == "advisor")
                      {
                           $location.url('/advisor/dashboard');
                      }
                      else
                      {
                           $location.url('/login');
                      }
        }
        else {

           // event.preventDefault();
            $location.url('/login');
        }


    $rootScope.$on('$routeChangeStart', function (event) {

        if (AuthService.isLoggedIn() == "true") {
            if (AuthService.getusertype() == "root")
                 {

                    $location.url('/root/dashboard');
                       }
                      else if (AuthService.getusertype() == "student")
                      {
                         $location.url('/student/dashboard');
                      }
                      else if (AuthService.getusertype() == "advisor")
                      {
                           $location.url('/advisor/dashboard');
                      }
                      else
                      {
                           $location.url('/login');
                      }
       }
        else {

           // event.preventDefault();
            $location.url('/login');
        }
    });


    
}]);