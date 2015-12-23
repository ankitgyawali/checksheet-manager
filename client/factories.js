angular.module('smApp').factory('notificationFactory', function () {
    return {
        success: function (text) {
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
            toastr.success(text,"Success");
        },

        info: function (text) {
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
            toastr.info(text,"Success");
        },

         warning: function (text) {
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
            toastr.warning(text,"Success");
        },
        error: function (text) {
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

angular.module('smApp').factory('AuthService',
  ['$q', '$timeout', '$http', '$cookies',
  function ($q, $timeout, $http, $cookies) {


    // return available functions for use in controllers
    return ({
      isLoggedIn: isLoggedIn,
      getusername: getusername,
      getusertype: getusertype,
      setusertype: setusertype,
      login: login,
      logout: logout
    });

    function isLoggedIn() {
        return $cookies.get('loggedin');
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

            if (status === 200) {
                user = true;
                console.log('datausername'+data.usertype)
                $cookies.put('username', data.username);
                $cookies.put('loggedin', 'true');
                $cookies.put('usertype', data.usertype);

                 console.log('loggedin='+getusertype());
                deferred.resolve();
            } else if (status == 404) {

                console.log('404 FAILED ' + usertype);
            } else {
                console.log("nope 200");
                $cookies.put('loggedin', 'false');
                deferred.reject();
            }

        })
        .error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.

            $cookies.put('loggedin', 'false');
            deferred.reject();

        });

      // return promise object
      return deferred.promise;

    }


    function logout() {
  
console.log('type inside logout: '+getusertype())
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

                console.log('404 FAILED ' + usertype);
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


        function getusertype() {
       return $cookies.get('usertype');
    }

       function setusertype(value) {
      $cookies.put('usertype', value);
      
    }



}]);