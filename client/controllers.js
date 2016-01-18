//Main login controller that handles login of three different user types
angular.module('smApp').controller('loginController', ['$scope', '$location', 'notificationFactory', 'AuthService', '$timeout',
    function($scope, $location, notificationFactory, AuthService, $timeout) {

        //Check if usertype has been set
        console.log("if auth get usertype: " + AuthService.getusertype());

        if (AuthService.getusertype() == undefined || AuthService.getusertype() == '') {
        //If usertype has not been set already set it to student so that student login is showed by default
        console.log("not defined so student");
        AuthService.setusertype('student');
        }
        //Finally get usertype from factory
        $scope.userType = AuthService.getusertype()
        //Set user local function that can be accessed in view
        $scope.setUser = function(val) {

            AuthService.setusertype(val);
            $scope.userType = AuthService.getusertype();

            $timeout(function() {
                console.log('setUser Auth from controler: ' + AuthService.getusertype())
            }, 100);

        }
        //Submit function that passes email password and usertype to factory so that it can be 
        //authenticated thre
        $scope.submit = function() {
            var x = AuthService.login($scope.Email, $scope.Password, $scope.userType)
                .then(function() {
                    //Setlocation url according to type of user that is logged in
                    //This url is locked via app.config in main.js
                    //The url point to dashboard type and provides necessary access controls
                    if (AuthService.isLoggedIn()) {
                        if (AuthService.getusertype() == "root") {
                            $location.url('/root/dashboard');
                        } else if (AuthService.getusertype() == "student") {
                            $location.url('/student/dashboard');
                        } else if (AuthService.getusertype() == "advisor") {
                            $location.url('/advisor/dashboard');
                        } else {
                            $location.url('/login');
                        }
                        notificationFactory.success('Logged in as ' + AuthService.getusername());

                    }

                })
                // Hangles authentication error
                .catch(function() {
                    notificationFactory.error('Invalid username & password combination');

                });


        };


    }
]);




// Student controller that handles student dashboard and student operation
angular.module('smApp').controller('studentController',
  ['$scope', '$routeParams','$location', 'notificationFactory', 'AuthService','$http', 
   function ($scope, $routeParams,$location, notificationFactory, AuthService,$http) {

      //Instantiates templateURL for dashboard constant at parent scope so subsequent child
        //controllers can modify it

        $scope.templateURL = 'partials/studentmodifychecksheet.html';
        // $scope.templateURL = 'partials/student.html';
        //Get username and type at parent scope
        $scope.username = AuthService.getusername();
        $scope.usertype = AuthService.getusertype();
        $scope.student_id =  AuthService.getuserid();
        //Method to modify templateURL 
        $scope.settemplateURL = function(temp) {
            $scope.templateURL = temp;
        };



        $http({
                        method: 'POST',
                        url: '/students',
                          headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        studentid: $scope.student_id
                    }

                    }).success(function(data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                        $scope.data = data;
                        $scope.student = data.student;
                        $scope.advisors = data.advisor;
                        $scope.checksheets = data.checksheet;
                
   
                        if(!$scope.student.registered){
                            notificationFactory.warning("First time login detected. Change your password to proceed.");
                            $scope.templateURL = "partials/studentsettings.html"
                        }
                        else{
                             $scope.templateURL = "partials/studentmodifychecksheet.html"
                        }
                    })
                    .error(function(data, status, headers, config) {
                        notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
                    });


      


         $http({
                        method: 'GET',
                        url: '/classes'

                    }).success(function(data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                        $scope.dpts = data.dpts;
                        $scope.courses = data.courses;

                        //console.log(JSON.stringify($scope.courses | suffix:135));

                    })
                    .error(function(data, status, headers, config) {
                        notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
                    });


         $scope.$watch('templateURL', function(val) {
            if($scope.student){
               if(!$scope.student.registered){
                if($scope.templateURL != "partials/studentsettings.html")
                {
                notificationFactory.warning("Change your settings to proceed.");
                }
                            $scope.templateURL = "partials/studentsettings.html"
                        }
                        else{
                             $scope.templateURL = val;
                        }
                }

        });


        //Logout function that utilizes factory service 
        $scope.logout = function() {
            AuthService.logout();
            notificationFactory.info("Logged out succesfully!")
            $location.url('/login');
        };



}]);

angular.module('smApp').controller('slotnoteController',
  ['$scope', '$location', 'notificationFactory', 'AuthService','$http','$uibModalInstance','pid','id', 
   function ($scope, $location, notificationFactory, AuthService,$http,$uibModalInstance,pid,id) {



$scope.pid = pid;
$scope.id = id;

if($scope.checksheetdata[$scope.pid][$scope.id].note){
$scope.tempNote = $scope.checksheetdata[$scope.pid][$scope.id].note;
}
else
{
    $scope.tempNote = '';
}
$scope.submitslotnote = function (){

$scope.checksheetdata[$scope.pid][$scope.id]['note'] = $scope.tempNote;
console.log("checksheetdata: "+JSON.stringify($scope.checksheetdata));
$uibModalInstance.dismiss('cancel');

}
$scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };


}]);


angular.module('smApp').controller('modifyslotController',
  ['$scope', '$location', 'notificationFactory', 'AuthService','$http','$uibModalInstance','pid','id', 
   function ($scope, $location, notificationFactory, AuthService,$http,$uibModalInstance,pid,id) {

$scope.pid = pid;
$scope.id = id;
$scope.slotedit = {}
$scope.buttondisabled = true;




//SET INITIAL SLOT MODAL VALUES FROM CHECKSHEET DATA HERE IF EXISTS???
            // slot object-> TAKEN BOOLEAN
            //                 Custom or from database BOOLEAN
            //                 NOTE STRING
            //                 CLASS -> PREFIX SUFFIX
            //                 credits: if not equal to 3
if($scope.checksheetdata[$scope.pid][$scope.id].note){
    $scope.slotedit.note = angular.copy($scope.checksheetdata[$scope.pid][$scope.id].note);

}
else
{
    $scope.slotedit.note = '';
}


if($scope.checksheetdata[$scope.pid][$scope.id].credits){
$scope.slotedit.credits = $scope.checksheetdata[$scope.pid][$scope.id].credits;
}
else
{
    $scope.slotedit.credits = 3;
}

if($scope.checksheetdata[$scope.pid][$scope.id].prefix){
    console.log("done");
$scope.slotedit.classprefix = $scope.checksheetdata[$scope.pid][$scope.id].prefix;
$scope.slotedit.classsuffix = $scope.checksheetdata[$scope.pid][$scope.id].suffix;
}
else
{
    $scope.slotedit.credits = 3;
}
if($scope.checksheetdata[$scope.pid][$scope.id].manual === undefined){
console.log("this");
    $scope.slotedit.type = '0';
}
else
{
    console.log("xas"+ $scope.checksheetdata[$scope.pid][$scope.id].manual);
    $scope.slotedit.type = '1';
}
$scope.greaterThan = function(prop, val){
    return function(item){

      return item[prop] >= val;
    }
}

$scope.checkpreq = true;


$scope.locksubmits = function(){
    console.log("pid:"+$scope.pid)
    console.log("id:"+$scope.id)
    if(!($scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prerequisite)){
            $scope.checkpreq = false;
    }
    else if($scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prerequisite == '1001') {
        
    }
    else if($scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prerequisite == '1002') {

    }
    else{

    }
    $scope.buttondisabled = !$scope.buttondisabled
}




$scope.$watch('slotedit.note', function(val) {

console.log("Changed: "+val);

 });

$scope.$watch('slotedit.credits', function(val) {

console.log("Changed: "+val);

 });


$scope.modifyslotdetails = function (){
$scope.slotedit.taken = '1';
console.log('slottempNote: '+$scope.slotedit.note);
$scope.checksheetdata[$scope.pid][$scope.id].note = $scope.slotedit.note;
$scope.checksheetdata[$scope.pid][$scope.id].prefix = $scope.slotedit.classprefix;
$scope.checksheetdata[$scope.pid][$scope.id].suffix = $scope.slotedit.classsuffix;

if($scope.slotedit.type == '1'){
$scope.checksheetdata[$scope.pid][$scope.id].manual = "1";
}
else
{
delete $scope.checksheetdata[$scope.pid][$scope.id].manual;
}
if($scope.slotedit.credits != 3) {
$scope.checksheetdata[$scope.pid][$scope.id].credits = $scope.slotedit.credits;
}
else
{
delete $scope.checksheetdata[$scope.pid][$scope.id].credits;
}
$uibModalInstance.dismiss('cancel');
}

$scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');

  };


}]);

// Student controller that handles modification of student checksheet
angular.module('smApp').controller('studentmodifychecksheetcontroller',
  ['$scope', '$location', 'notificationFactory', 'AuthService','$http','$uibModal', 
   function ($scope, $location, notificationFactory, AuthService,$http,$uibModal) {

$scope.test = function () {
    console.log('--------------------------------------');
    console.log(JSON.stringify($scope.checksheetdata));
    console.log('--------------------------------------');
 console.log(JSON.stringify($scope.checksheetinview));
console.log('---------------------------------');
 
}
 $scope.modifySlot = function(pid,id) {
    console.log(pid);
                var modalInstance = $uibModal.open({
                templateUrl: 'partials/studentmodifySlot.html',
                controller: 'modifyslotController',
                scope: $scope,
                size: 'lg',
                resolve: {
                    pid: function() {
                        return pid;
                    },
                    id: function() {
                        return id;
                    }
                }
            });


        };


 $scope.addSlotNote = function(pid,id) {
    console.log(pid);
                var modalInstance = $uibModal.open({
                templateUrl: 'partials/studentmodifyslotnote.html',
                controller: 'slotnoteController',
                scope: $scope,
                resolve: {
                    pid: function() {
                        return pid;
                    },
                    id: function() {
                        return id;
                    }
                }
            });


        };






$scope.$watch('data', function(val) {
if($scope.student){


if($scope.student.checksheetprotoid.length == '1'){
$scope.divshow = true;
$scope.checksheetinview = $scope.checksheets[0];
$scope.checksheetinviewindex = 0;
}
else
{
    $scope.divshow = false;
}



}
 });

$scope.$watch('checksheetdata', function(newVal, oldVal) {
if(oldVal ===undefined){
if($scope.student.checksheetdata[$scope.checksheetinviewindex])
    //view index is valid sckip this for now
// if(!$scope.student.checksheetdata[$scope.checksheetinviewindex].length)
{
    console.log("ok");
    console.log($scope.student.checksheetdata[$scope.checksheetinviewindex]);
$scope.checksheetdata = $scope.student.checksheetdata[$scope.checksheetinviewindex];

 // console.log('x'+$scope.student.checksheetprotoid.blockid.length);

} else { 

$scope.checksheetdata = new Array($scope.checksheets[$scope.checksheetinviewindex].blockid.length)
console.log(JSON.stringify($scope.checksheets[$scope.checksheetinviewindex].blockid));

console.log($scope.checksheetdata);
 angular.forEach($scope.checksheets[$scope.checksheetinviewindex].blockid,function(value,index){
               $scope.checksheetdata[index] = new Array(value.details.length);

                for (i = 0;i < value.details.length; i++) 
                    {
                    $scope.checksheetdata[index][i] = {};
                    }
              
            });

console.log($scope.checksheetdata);

} }


});



$scope.$watch('checksheetinviewindex', function(newVal, oldVal) {
if(newVal != oldVal){
if($scope.student.checksheetdata[$scope.checksheetinviewindex])
    //view index is valid sckip this for now
// if(!$scope.student.checksheetdata[$scope.checksheetinviewindex].length)
{
    console.log("ok");
    console.log($scope.student.checksheetdata[$scope.checksheetinviewindex]);
$scope.checksheetdata = $scope.student.checksheetdata[$scope.checksheetinviewindex];

 // console.log('x'+$scope.student.checksheetprotoid.blockid.length);

} else { 

$scope.checksheetdata = new Array($scope.checksheets[$scope.checksheetinviewindex].blockid.length)
console.log(JSON.stringify($scope.checksheets[$scope.checksheetinviewindex].blockid));

console.log($scope.checksheetdata);
 angular.forEach($scope.checksheets[$scope.checksheetinviewindex].blockid,function(value,index){
               $scope.checksheetdata[index] = new Array(value.details.length);

                for (i = 0;i < value.details.length; i++) 
                    {
                    $scope.checksheetdata[index][i] = {};
                    }
              
            });

console.log($scope.checksheetdata);

} }


});

  $scope.setdivshowtrue = function(val){ 
  $scope.checksheetinview = $scope.checksheets[val];
  $scope.checksheetinviewindex = val;
  $scope.divshow = true; }
 

}]);


// Student controller that handles modification of student settings
angular.module('smApp').controller('studentsettingscontroller',
  ['$scope', '$location', 'notificationFactory', 'AuthService','$http', 
   function ($scope, $location, notificationFactory, AuthService,$http) {
    $scope.setting = {};
    $scope.updatestudentsettings = function () {
        $scope.setting._id = $scope.student_id;
        $scope.setting.password = $scope.studentnewpassword;
        $scope.setting.registered = true;
               $http({
                        method: 'PUT',
                        url: '/studentsetting',
                          headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        setting: $scope.setting
                    }

                    }).success(function(data, status, headers, config) {
                    notificationFactory.success("Settings update succesfully.");
                    $scope.student.registered = "true"
                    $scope.settemplateURL("partials/studentsummary.html");

                    })
                    .error(function(data, status, headers, config) {
                        notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
                    });
    }

}]);
