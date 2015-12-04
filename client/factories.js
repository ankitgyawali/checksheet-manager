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
  ['$q', '$timeout', '$http', '$cookieStore',
  function ($q, $timeout, $http, $cookieStore) {


    // return available functions for use in controllers
    return ({
      isLoggedIn: isLoggedIn,
      getusername: getusername,
      getusertype: getusertype,
      setusertype: setusertype,
      login: login,
      logout: logout,
      register: register,
    });

    function isLoggedIn() {
        return $cookieStore.get('loggedin');
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
                $cookieStore.put('username', data.username);
                $cookieStore.put('loggedin', 'true');
                $cookieStore.put('usertype', data.usertype);

                deferred.resolve();
            } else if (status == 404) {

                console.log('404 FAILED ' + usertype);
            } else {
                console.log("nope 200");
                $cookieStore.put('loggedin', 'false');
                deferred.reject();
            }

        })
        .error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.

            $cookieStore.put('loggedin', 'false');
            deferred.reject();

        });

      // return promise object
      return deferred.promise;

    }


    function logout() {
    // create a new instance of deferred
    var deferred = $q.defer();



     $cookieStore.put('loggedin', 'false');

        $http({
            method: 'GET',
            url: '/logout'

        }).success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available

            if (status === 200) {
                
            $cookieStore.remove('usertype');
            $cookieStore.remove('username');
            $cookieStore.remove('loggedin');
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

      return $cookieStore.get('username');
    }


        function getusertype() {
       return $cookieStore.get('usertype');
    }

       function setusertype(value) {
      $cookieStore.put('usertype', value);
      
    }



    function register(username, password) {

      // create a new instance of deferred
      var deferred = $q.defer();

      // send a post request to the server
      $http.post('/user/register', {username: username, password: password})
        // handle success
        .success(function (data, status) {
          if(status === 200 && data.status){
            deferred.resolve();
          } else {
            deferred.reject();
          }
        })
        // handle error
        .error(function (data) {
          deferred.reject();
        });

      // return promise object
      return deferred.promise;

    }

}]);