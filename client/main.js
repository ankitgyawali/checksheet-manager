// Designed by: Ankit Gyawali
// Email: agyaw792@gmail.com
// Description: Defined the structures and route changes for syllabus manager.
// Also contains extra filters and directives that is needed througout the app.

//Define angular app and its dependencies
var smApp = angular.module('smApp', ['ngRoute', 'ngCookies', 'angularUtils.directives.dirPagination',
    'ui.bootstrap', 'angular.filter', 'angular-confirm', 'passwordModule', 'nvd3'
]);

//Route configuration to provide different level of access controls to different user group
smApp.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'partials/login.html',
            controller: 'loginController'
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
            controller: 'studentController',

        })
        .when('/advisor/dashboard', {
            templateUrl: 'partials/advisor.html',
            controller: 'advisorController'
        })

    // use the HTML5 History API
    // $locationProvider.html5Mode(true);
});


//Filter to captalize name of user
smApp.filter('firstCapitalize', function() {
    return function(input) {
        return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});


//Authentication. Checks if user is logged in on every route change
smApp.run(['$rootScope', '$location', 'AuthService',
    function($rootScope, $location, AuthService) {
        //If user is logged in
        if (AuthService.isLoggedIn() == "true") {
            //Define route location for each user group
            if (AuthService.getusertype() == "root") {
                $location.url('/root/dashboard');
            } else if (AuthService.getusertype() == "student") {
                $location.url('/student/dashboard');
            } else if (AuthService.getusertype() == "advisor") {
                $location.url('/advisor/dashboard');
            } else {
                $location.url('/login');
            }
        } else {

            // event.preventDefault();
            $location.url('/login');
        }


        $rootScope.$on('$routeChangeStart', function(event) {

            if (AuthService.isLoggedIn() == "true") {
                if (AuthService.getusertype() == "root") {

                    $location.url('/root/dashboard');
                } else if (AuthService.getusertype() == "student") {
                    $location.url('/student/dashboard');
                } else if (AuthService.getusertype() == "advisor") {
                    $location.url('/advisor/dashboard');
                } else {
                    $location.url('/login');
                }
            } else {

                // event.preventDefault();
                $location.url('/login');
            }
        });



    }
]);

//Quick angular function to check if value is defined or null
angular.isUndefinedOrNull = function(val) {
    return angular.isUndefined(val) || val === null
}