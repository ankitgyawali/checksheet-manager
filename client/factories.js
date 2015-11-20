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

angular.module('myApp').factory('AuthService',
  ['$q', '$timeout', '$http',
  function ($q, $timeout, $http) {

    // create user variable
    var user = null;
    var usertype = '';
    var username = ''

    // return available functions for use in controllers
    return ({
      isLoggedIn: isLoggedIn,
      getusername: getusername,
      getusertype: getusertype,
      getUserStatus: getUserStatus,
      login: login,
      logout: logout,
      register: register
    });

    function isLoggedIn() {
        if(user) {
          return true;
        } else {
          return false;
        }
    }

    function login(username, password, type) {

      // create a new instance of deferred
      var deferred = $q.defer();


             $http({
  method  : 'POST',
  url     : '/root',
    // set the headers so angular passing info as form data (not request payload)
  headers : { 'Content-Type': 'application/json' },
  data    :  {
              username: username,
              password: password,
              type:'root'
            }

 }).success(function(data, status, headers, config) {
    // this callback will be called asynchronously
    // when the response is available
  if(status === 200 && data.status){
            user = true;
            username = data.username;
            usertype = data.usertype;
            deferred.resolve();
          } else {
            user = false;
            deferred.reject();
          }

  })
  .error(function(data, status, headers, config) {
    // called asynchronously if an error occurs
    // or server returns response with an error status.
          user = false;
          deferred.reject();
  });


      // return promise object
      return deferred.promise;

    }


    function getUserStatus() {
      return user;
    }

        function getusername() {
      return username;
    }

        function getusertype() {
      return usertype;
    }

    function logout() {

      // create a new instance of deferred
      var deferred = $q.defer();

      // send a get request to the server
      $http.get('/user/logout')
        // handle success
        .success(function (data) {
          user = false;
          deferred.resolve();
        })
        // handle error
        .error(function (data) {
          user = false;
          deferred.reject();
        });

      // return promise object
      return deferred.promise;

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