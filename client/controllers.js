angular.module('smApp').controller('loginController',
  ['$scope', '$location', 'notificationFactory','AuthService', '$timeout',
   function ($scope, $location,notificationFactory,AuthService,$timeout) {


console.log("if auth get usertype: " +AuthService.getusertype());

       if(AuthService.getusertype()== undefined || AuthService.getusertype()=='' ){

        console.log("not defined so student");
      AuthService.setusertype('student');

    }

 $scope.userType = AuthService.getusertype()

   

    $scope.setUser = function(val) {
     
    AuthService.setusertype(val);
    $scope.userType = AuthService.getusertype();

      $timeout(function() {
     console.log('setUser Auth from controler: '+AuthService.getusertype())
    }, 100);
  
  } 

  console.log(AuthService.getusertype());

     $scope.submit = function (){
      var x = AuthService.login($scope.Email,$scope.Password,$scope.userType)
       .then(function () {
        if (AuthService.isLoggedIn())
        {

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
        notificationFactory.success('Logged in as ' + AuthService.getusername());  
        
        }
   
     })
        // handle error
       .catch(function () {
        notificationFactory.error('Invalid username & password combination');
        
        });

     
        };


}]);



angular.module('smApp').controller('dashboardController',
  ['$scope', '$location', 'notificationFactory', 'AuthService','$cookies', 
   function ($scope, $location, notificationFactory, AuthService,$cookies) {


      console.log("dashboard check: "+AuthService.isLoggedIn());
       $scope.username = AuthService.getusername();
       $scope.usertype = AuthService.getusertype();
       $scope.lol = $cookies.get('loggedin');

    $scope.logout = function (){
    AuthService.logout();
    notificationFactory.info("Logged out succesfully!")
    $location.url('/login');
     };



}]);


angular.module('smApp').controller('rootController',
  ['$scope', '$location', 'notificationFactory', 'AuthService','$cookies', 
   function ($scope, $location, notificationFactory, AuthService,$cookies) {


    $scope.templateURL = 'partials/rdept.html';
     
       $scope.username = AuthService.getusername();
       $scope.usertype = AuthService.getusertype();
       $scope.lol = $cookies.get('loggedin');

       $scope.settemplateURL = function (temp){
      $scope.templateURL  = temp;
     };


    $scope.logout = function (){
    AuthService.logout();
    notificationFactory.info("Logged out succesfully!")
    $location.url('/login');
     };

}]);

angular.module('smApp').controller('rootmanagerController',
  ['$scope', '$location', 'notificationFactory','$uibModal', '$http','AuthService',
   function ($scope, $location, notificationFactory,$uibModal,$http, AuthService) {


}]);

angular.module('smApp').controller('rootClassController',
  ['$scope', 'notificationFactory','$uibModal', '$http','AuthService',
   function ($scope, notificationFactory,$uibModal,$http, AuthService) {

     $http({
            method: 'GET',
            url: '/classes'

        }).success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
             $scope.courses = data.courses;
             $scope.dpts = data.dpts;

        })
        .error(function(data, status, headers, config) {
             console.log(" Not Doneee "+ status+data+headers+config);


        });
 $scope.currentPage = 1;
 $scope.pageSize = 5;
 $scope.numtoadd = 1;



 $scope.classestoAdd = [];
 $scope.newClasses = function(num) {

    return new Array(num);
}
$scope.newClassesprimitive = $scope.newClasses;

$scope.setClassprefix = function(prefix,index){
  $scope.classestoAdd[index].prefix = prefix;

}


$scope.delnewClasses = function(index) {
  $scope.numtoadd = $scope.numtoadd - 1;
   $scope.classestoAdd.splice(index,1);
}

 $scope.addClasses = function() {

     $http({
            method: 'POST',
            url: '/classes',
            // set the headers so angular passing info as form data (not request payload)
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                arraytoAdd: $scope.classestoAdd
            }

        }).success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
  
             $scope.settemplateURL('partials/rclass.html');
            notificationFactory.info("Successfully added classes. ");

        })
        .error(function(data, status, headers, config) {
             console.log(" Not Doneee "+ status+data+headers+config);
                 notificationFactory.error("Error: Status Code "+status+". Contact admin if issue persists.")
      
        });
    
}





 $scope.modifyclass = function (course){

 var modalInstance = $uibModal.open({
      templateUrl: 'partials/classModal.html',
      controller: 'classModalController',
      scope: $scope,
      resolve: {
        course: function () {
          return course;
        }
      }
    });


};



}]);

angular.module('smApp').controller('rootDeptController',
  ['$scope', '$location', 'notificationFactory','$uibModal', '$http','AuthService',
   function ($scope, $location, notificationFactory,$uibModal,$http, AuthService) {

 $http({
            method: 'GET',
            url: '/departments'

        }).success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
             $scope.departments = data;

        })
        .error(function(data, status, headers, config) {
             console.log(" Not Doneee "+ status+data+headers+config);

        });


 $scope.currentPage = 1;
 $scope.pageSize = 3;
 $scope.numtoadd = 1;

 $scope.arraytoAdd = [];
 $scope.newDepts = function(num) {

    return new Array(num);
}
$scope.newDeptsprimitive = $scope.newDepts;

$scope.delnewDepts = function(index) {
  $scope.numtoadd = $scope.numtoadd - 1;
   $scope.arraytoAdd.splice(index,1);

  
}

 $scope.addDepts = function() {
    console.log("array is: "+$scope.arraytoAdd + 'or'+ JSON.stringify($scope.arraytoAdd));
     $http({
            method: 'POST',
            url: '/departments',
            // set the headers so angular passing info as form data (not request payload)
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                arraytoAdd: $scope.arraytoAdd
            }

        }).success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
  
             $scope.settemplateURL('partials/rdept.html');
            notificationFactory.info("Successfully added departments: ");

        })
        .error(function(data, status, headers, config) {
             console.log(" Not Doneee "+ status+data+headers+config);
                 notificationFactory.error("Error: Status Code "+status+". Contact admin if issue persists.")
      
        });
    
}

 $scope.modifyDept = function (depID){

 var modalInstance = $uibModal.open({
      templateUrl: 'partials/deptModal.html',
      controller: 'deptModalController',
      scope: $scope,
      resolve: {
        depID: function () {
          return depID;
        }
      }
    });


};

}]);

angular.module('smApp').controller('classModalController',
  ['$scope', '$filter','$uibModalInstance', 'course', '$http', 'notificationFactory', '$location',
    function ($scope,$filter,$uibModalInstance, course,$http,notificationFactory,$location) {

$scope.classID = angular.copy(course);
$scope.className = $scope.classID.name;
$scope.classDep = $scope.classID.department;
$scope.classprefix = $scope.classID.prefix;
$scope.setprefix = function(prefix){
  $scope.classID.prefix = prefix;
}
$scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

$scope.delete = function () {

    $http({
            method: 'DELETE',
            url: '/classes',
            // set the headers so angular passing info as form data (not request payload)
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                deleteID: course._id
            }

        }).success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            console.log("deleted: "+course._id);
            $uibModalInstance.dismiss('cancel');
            //$location.url('/root/dashboard');
            
             if (status === 200) {
       
     $scope.courses.splice($scope.courses.indexOf(course),1);
      notificationFactory.info("Successfully deleted: "+$scope.classID.name)
            }

        })
        .error(function(data, status, headers, config) {

        $uibModalInstance.dismiss('cancel');
        notificationFactory.error("Error: Status Code "+status+". Contact admin if issue persists.")
        });


  };



$scope.modify = function () {
 // create a new instance of deferred


    $http({
            method: 'PUT',
            url: '/classes',
            // set the headers so angular passing info as form data (not request payload)
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                classID: $scope.classID
            }

        }).success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            $uibModalInstance.dismiss('cancel');
            //$location.url('/root/dashboard');
            
             if (status === 200) {
                angular.copy($scope.classID,course);

               notificationFactory.info("Successfully updated: "+$scope.classID.name)
            }

        })
        .error(function(data, status, headers, config) {

        $uibModalInstance.dismiss('cancel');
        notificationFactory.error("Error: Status Code "+status+". Contact admin if issue persists.")
        });



  };

}]);

angular.module('smApp').controller('deptModalController',
  ['$scope', '$filter','$uibModalInstance', 'depID', '$http', 'notificationFactory', '$location',
    function ($scope,$filter,$uibModalInstance, depID,$http,notificationFactory,$location) {


$scope.newID = angular.copy(depID);
$scope.depName = $scope.newID.name;


$scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.delete = function () {

    $http({
            method: 'DELETE',
            url: '/departments',
            // set the headers so angular passing info as form data (not request payload)
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                deleteID: depID._id
            }

        }).success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            console.log("deleted: "+depID._id);
            $uibModalInstance.dismiss('cancel');
            //$location.url('/root/dashboard');
            
             if (status === 200) {
              console.log($scope.departments[0].name);
     $scope.departments.splice($scope.departments.indexOf(depID),1);
      notificationFactory.info("Successfully deleted: "+$scope.newID.name)
            }

        })
        .error(function(data, status, headers, config) {

        $uibModalInstance.dismiss('cancel');
        notificationFactory.error("Error: Status Code "+status+". Contact admin if issue persists.")
        });


  };



$scope.modify = function () {
 // create a new instance of deferred


    $http({
            method: 'PUT',
            url: '/departments',
            // set the headers so angular passing info as form data (not request payload)
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                newID: $scope.newID
            }

        }).success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            $uibModalInstance.dismiss('cancel');
            //$location.url('/root/dashboard');
            
             if (status === 200) {
                angular.copy($scope.newID,depID);

               notificationFactory.info("Successfully updated: "+$scope.newID.name)
            }

        })
        .error(function(data, status, headers, config) {

        $uibModalInstance.dismiss('cancel');
        notificationFactory.error("Error: Status Code "+status+". Contact admin if issue persists.")
        });



  };

}]);

angular.module('smApp').controller('advisorController',
  ['$scope', '$location', 'notificationFactory', 'AuthService','$cookies', 
   function ($scope, $location, notificationFactory, AuthService,$cookies) {


      console.log("dashboard check: "+AuthService.isLoggedIn());
       $scope.username = AuthService.getusername();
       $scope.usertype = AuthService.getusertype();
       $scope.lol = $cookies.get('loggedin');

    $scope.logout = function (){
    AuthService.logout();
    notificationFactory.info("Logged out succesfully!")
    $location.url('/login');
     };



}]);



angular.module('smApp').controller('studentController',
  ['$scope', '$location', 'notificationFactory', 'AuthService','$cookies', 
   function ($scope, $location, notificationFactory, AuthService,$cookies) {


      console.log("dashboard check: "+AuthService.isLoggedIn());
       $scope.username = AuthService.getusername();
       $scope.usertype = AuthService.getusertype();
       $scope.lol = $cookies.get('loggedin');

    $scope.logout = function (){
    AuthService.logout();
    notificationFactory.info("Logged out succesfully!")
    $location.url('/login');
     };



}]);