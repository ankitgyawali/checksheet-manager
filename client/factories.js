//Factory for notification toaster for the app
angular.module('smApp').factory('notificationFactory', function() {
    return {
        //Success toaster for app
        success: function(text) {
            toastr.options = {
                "closeButton": true,
                "debug": false,
                "newestOnTop": false,
                "progressBar": true,
                "positionClass": "toast-bottom-right",
                "preventDuplicates": true,
                "onclick": null,
                "showDuration": "300",
                "hideDuration": "1000",
                "timeOut": "3500",
                "extendedTimeOut": "1000",
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut"
            };
            toastr.success(text, "Success");
        },
        //Information toaster
        info: function(text) {
            toastr.options = {
                "closeButton": true,
                "debug": false,
                "newestOnTop": false,
                "progressBar": true,
                "positionClass": "toast-bottom-right",
                "preventDuplicates": true,
                "onclick": null,
                "showDuration": "300",
                "hideDuration": "1000",
                "timeOut": "3500",
                "extendedTimeOut": "1000",
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut"
            };
            toastr.info(text, "Info.");
        },
        //Warning toaster
        warning: function(text) {
            toastr.options = {
                "closeButton": true,
                "debug": false,
                "newestOnTop": false,
                "progressBar": true,
                "positionClass": "toast-bottom-right",
                "preventDuplicates": true,
                "onclick": null,
                "showDuration": "300",
                "hideDuration": "1000",
                "timeOut": "3500",
                "extendedTimeOut": "1000",
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut"
            };
            toastr.warning(text, "Caution");
        },
        //Error toaster
        error: function(text) {
            toastr.options = {
                "closeButton": true,
                "debug": false,
                "newestOnTop": false,
                "progressBar": true,
                "positionClass": "toast-bottom-right",
                "preventDuplicates": true,
                "onclick": null,
                "showDuration": "300",
                "hideDuration": "1000",
                "timeOut": "3500",
                "extendedTimeOut": "1000",
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut"
            };
            toastr.error(text, "Error");

        }
    };
});


//Authentication service for app
//Help user authentication [login/logout]
//Holds persistant data for pagination size
//Contains service function to generate random password
//Checks if user is logged in, or is registered
angular.module('smApp').factory('AuthService', ['$q', '$timeout', '$http', '$cookies',
    function($q, $timeout, $http, $cookies) {
        //Default pagesize for view
        var pageSize = 10;
        // return available functions for use in controllers
        return ({ //All of the data is stored as cookie by utilizing $cookies
            isLoggedIn: isLoggedIn, //Is user logged in
            getusername: getusername, //Get crrent users firstname
            getlastname: getlastname, //Get current users last name
            getusertype: getusertype, //Get current users type
            setusertype: setusertype, //Set current users type
            getuserid: getuserid, //Get current users id
            login: login, //Login a user by checking username and password
            logout: logout,//Logout a user
            generatePassword: generatePassword, //Generate random password
            getPaginationSize: getPaginationSize, //Get & set pagintion size
            setPaginationSize: setPaginationSize,
            isRegistered: isRegistered,//Get and set if user if reigstered
            setRegistered: setRegistered

        });

        function setRegistered(value) {
            $cookies.put('registered', value);

        }

        function isRegistered() {
            return (angular.isUndefinedOrNull($cookies.get('registered')));
        }

        function getPaginationSize() {
            return pageSize;
        }

        function setPaginationSize(num) {
            pageSize = num;
        }

        function isLoggedIn() {
            return $cookies.get('loggedin');
        }

        function getuserid() {
            return $cookies.get('_id');
        }

        function generatePassword() {
            var temp = '';
            var length = 8; //Change this for longer default rando password
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < length; i++) {
                temp += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return temp;
        }

        function login(uname, upwd, utype) {

            // create a new instance of deferred
            var deferred = $q.defer();

            $http({
                    method: 'POST',
                    url: '/login',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        username: uname,
                        password: upwd,
                        type: utype
                    }

                }).success(function(data, status, headers, config) {
                    // this callback will be called asynchronously
                    // when the response is available

                    if (status === 200) { //Login user
                        //If true set cookies
                        $cookies.put('registered', data.person.registered);
                        $cookies.put('username', data.person.firstname);
                        $cookies.put('lastname', data.person.lastname);
                        $cookies.put('loggedin', 'true');
                        $cookies.put('usertype', data.usertype);
                        $cookies.put('_id', data.person._id);

                        deferred.resolve();
                    } else if (status == 404) {

                    } else {
                        //Else set logged in to false
                        $cookies.put('loggedin', 'false');
                        deferred.reject();
                    }

                })
                .error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.

                    $cookies.put('loggedin', 'false');
                    deferred.reject(); //Promise for loggin in 

                });

            // return promise object
            return deferred.promise;

        }


        function logout() { //Logout a user

            // create a new instance of deferred
            var deferred = $q.defer();

            $cookies.put('loggedin', 'false');

            $http({
                    method: 'GET',
                    url: '/logout'

                }).success(function(data, status, headers, config) {
                    // this callback will be called asynchronously
                    // when the response is available

                    if (status === 200) {
                        //AuthService.setusertype($cookies.usertype);    
                        $cookies.remove('usertype');
                        $cookies.remove('username');
                        $cookies.remove('loggedin');
                        deferred.resolve();
                    } else if (status == 404) {

                    } else {
                        deferred.reject();
                    }

                })
                .error(function(data, status, headers, config) {
                    deferred.reject();

                });

            // return promise object
            return deferred.promise;
        }

        function getusername() {
            return $cookies.get('username');
        }

        function getlastname() {
            return $cookies.get('lastname');
        }

        function getusertype() {
            return $cookies.get('usertype');
        }

        function setusertype(value) {
            $cookies.put('usertype', value);
        }

    }
]);