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
                        $scope.student = data.student;
                        $scope.checksheets = data.checksheet
                        $scope.advisors = data.advisor;
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

if(!($scope.checksheetdata[$scope.pid][$scope.id]===null)){
$scope.tempNote = $scope.checksheetdata[$scope.pid][$scope.id].note;
}
else
{
    $scope.tempNote = '';
}

$scope.submitslotnote = function (){

if(angular.isUndefinedOrNull($scope.checksheetdata[$scope.pid][$scope.id])){
$scope.checksheetdata[$scope.pid][$scope.id] = {}
$scope.checksheetdata[$scope.pid][$scope.id].note = $scope.tempNote;

}
else{
$scope.checksheetdata[$scope.pid][$scope.id].note = $scope.tempNote;  
}
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
if(angular.isUndefinedOrNull($scope.checksheetdata[$scope.pid][$scope.id])){

$scope.slotedit.credits = 3;
$scope.slotedit.note = '';
$scope.slotedit.type = '0';
}
else
{

$scope.slotedit.classprefix = $scope.checksheetdata[$scope.pid][$scope.id].prefix;
$scope.slotedit.classsuffix = $scope.checksheetdata[$scope.pid][$scope.id].suffix;

$scope.slotedit.note = angular.copy($scope.checksheetdata[$scope.pid][$scope.id].note);

$scope.slotedit.credits = $scope.checksheetdata[$scope.pid][$scope.id].credits;

if(($scope.checksheetdata[$scope.pid][$scope.id].credits === undefined)){
$scope.slotedit.credits = 3;
}
else
{
    $scope.slotedit.credits = $scope.checksheetdata[$scope.pid][$scope.id].credits;
}



if(!($scope.checksheetdata[$scope.pid][$scope.id].manual === undefined)){
$scope.slotedit.type = '1';
}
else{
    $scope.slotedit.type = '0';
}


}




$scope.greaterThan = function(prop, val){
    return function(item){
      return item[prop] >= val;
    }
}

$scope.checkpreq = true;

if(!($scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prerequisite)){
    $scope.checkpreq = false;
    }
else if($scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prerequisite == '1001') {
    for (i = 0;i<$scope.checksheetdata.length; i++) {
    for (j = 0;j<$scope.checksheetdata[i].length; j++) {
    if(!(angular.isUndefinedOrNull($scope.checksheetdata[i][j]))){
    if(!(angular.isUndefinedOrNull($scope.checksheetdata[i][j].suffix))){
    console.log("this: "+$scope.checksheetdata[i][j].prefix+" versus "+$scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prereqconstraint.prefix);
    console.log("this: "+$scope.checksheetdata[i][j].suffix+" versus "+$scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prereqconstraint.suffix);
    if (($scope.checksheetdata[i][j].prefix == $scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prereqconstraint.prefix) && ($scope.checksheetdata[i][j].suffix == $scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prereqconstraint.suffix)) {
    console.log("found a match!");
    $scope.checkpreq = false;
    break;break;break;break;
        }   //if statement
    }//if outer
    }

    }  //for j
    } //for j
    
    } //else if 
      // <option ng-value="1002">Two class required (Class#1 AND Class#2)</option>
      // <option ng-value="1003">One of two classes required (Class#1 OR Class#2)</option>
    else if($scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prerequisite == '1002') {
    for (i = 0;i<$scope.checksheetdata.length; i++) {
    for (j = 0;j<$scope.checksheetdata[i].length; j++) {
    if(!(angular.isUndefinedOrNull($scope.checksheetdata[i][j]))){
    if(!(angular.isUndefinedOrNull($scope.checksheetdata[i][j].suffix))){
    if (($scope.checksheetdata[i][j].prefix == $scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prereqconstraint.prefix) && ($scope.checksheetdata[i][j].suffix == $scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prereqconstraint.suffix)) {
            for (k = 0;k<$scope.checksheetdata.length; k++) {
            for (l = 0;l<$scope.checksheetdata[k].length; l++) {
            if(!(angular.isUndefinedOrNull($scope.checksheetdata[k][l]))){
                if(!(angular.isUndefinedOrNull($scope.checksheetdata[k][l].suffix))){
              if (($scope.checksheetdata[k][l].prefix == $scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prereqconstraint.prefix2) && ($scope.checksheetdata[k][l].suffix == $scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prereqconstraint.suffix2)) {
            console.log("found a match!");
            $scope.checkpreq = false;
            break;break;break;break;break;break;
                }   //if statement
            }}//inner ifs
            }  //for j
            } //for j

        }   //if statement
    }}//outer ifs
    }  //for j
    } //for j
    }
    else{
        for (i = 0;i<$scope.checksheetdata.length; i++) {
        for (j = 0;j<$scope.checksheetdata[i].length; j++) {
        if(!(angular.isUndefinedOrNull($scope.checksheetdata[i][j]))){
    if(!(angular.isUndefinedOrNull($scope.checksheetdata[i][j].suffix))){
       if ((($scope.checksheetdata[i][j].prefix == $scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prereqconstraint.prefix) && ($scope.checksheetdata[i][j].suffix == $scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prereqconstraint.suffix)) ||
        (($scope.checksheetdata[i][j].prefix == $scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prereqconstraint.prefix2) && ($scope.checksheetdata[i][j].suffix == $scope.checksheetinview.blockid[$scope.pid].details[$scope.id].prereqconstraint.suffix2))) {
        console.log("found a match!");
        $scope.checkpreq = false;
        break;break;break;break;
            }   //if statement
        }}//ifs
        }  //for j
        } //for j
    }


$scope.locksubmits = function(){
    console.log("pid:"+$scope.pid)
    console.log("id:"+$scope.id)
    $scope.buttondisabled = !$scope.buttondisabled
 
    
}



$scope.modifyslotdetails = function (){
$scope.slotedit.taken = '1';
if(!(angular.isUndefinedOrNull($scope.checksheetdata[$scope.pid][$scope.id]))){

$scope.checksheetdata[$scope.pid][$scope.id].note = $scope.slotedit.note;
$scope.checksheetdata[$scope.pid][$scope.id].prefix = $scope.slotedit.classprefix;
$scope.checksheetdata[$scope.pid][$scope.id].suffix = $scope.slotedit.classsuffix;
}
else{
    $scope.checksheetdata[$scope.pid][$scope.id] ={};
$scope.checksheetdata[$scope.pid][$scope.id].note = $scope.slotedit.note;
$scope.checksheetdata[$scope.pid][$scope.id].prefix = $scope.slotedit.classprefix;
$scope.checksheetdata[$scope.pid][$scope.id].suffix = $scope.slotedit.classsuffix;

}
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
console.log('slottempNote: '+$scope.checksheetdata[$scope.pid][$scope.id].suffix===undefined);
console.log('slottempNote: '+$scope.checksheetdata[$scope.pid][$scope.id].suffix!==undefined);

}

$scope.cancel = function () {
    console.log('type: '+$scope.checksheetinview.blockid[$scope.pid].details);
    $uibModalInstance.dismiss('cancel');

  };


}]);




// Student controller that handles modification of student checksheet
angular.module('smApp').controller('studentmodifychecksheetcontroller',
  ['$scope', '$location', 'notificationFactory', 'AuthService','$http','$uibModal', 
   function ($scope, $location, notificationFactory, AuthService,$http,$uibModal) {


      // if($scope.student.checksheetprotoid.length == '1'){
      //                      $scope.divshow = true;
      //                       $scope.checksheetinview = $scope.checksheets[0];
      //                       $scope.checksheetinviewindex = 0;
      //                       console.log('chkss:'+JSON.stringify($scope.student.checksheets));
      //                       console.log('set:'+JSON.stringify($scope.student.checksheetdata));
      //                       $scope.checksheetdata = $scope.student.checksheetdata[0];
      //                   }
      //                   else{
      //                       $scope.divshow = false;
      //                   }




                    $scope.divshow = '0'; 
                    $scope.setdivshowtrue = function(val){ 
                    $scope.checksheetinview = $scope.checksheets[val];
                    $scope.checksheetinviewindex = val;
                    console.log('x'+JSON.stringify($scope.student.checksheetdata[$scope.checksheetinviewindex]));
                    $scope.checksheetdata = $scope.student.checksheetdata[$scope.checksheetinviewindex];
                    $scope.divshow = '1'; 
                    console.log(JSON.stringify($scope.checksheetdata));
                    }

  $scope.isFilled = function(pid,id){

    if(angular.isUndefinedOrNull($scope.checksheetdata[pid][id])){
        return true;
    }
    else{
         if(angular.isUndefinedOrNull($scope.checksheetdata[pid][id].prefix))
         {
            return true;
         }
         return false;
    }
   
 }


           
                        

// //Watch for changes in bloc description
// $scope.$watch('divshow', function(newVal, oldVal) {
// if($scope.blockdetails){
//     for(var i=0; i < $scope.blockdetails.length; i++)
//     {
//     if ($scope.blockdetails[i]._id == val){
//     $scope.blockdetail = $scope.blockdetails[i];
//         break;
//     }
//     }
// }
// });






$scope.submitchecksheetdata = function () {

    for (i = 0;i<$scope.checksheetdata.length; i++) {
    for (j = 0;j<$scope.checksheetdata[i].length; j++) {

        if ($scope.checksheetdata[i][j].manual) {
        console.log("found: "+JSON.stringify($scope.courses));
        console.log("found: "+JSON.stringify($scope.checksheetdata[i][j]));
                for (k = 0;k<$scope.courses.length; k++) {

                if(($scope.checksheetdata[i][j].prefix==$scope.courses[k].prefix)&& ($scope.checksheetdata[i][j].suffix==$scope.courses[k].suffix)){
                delete $scope.checksheetdata[i][j].manual;
                break;
                }

                } // for  k loop end

            }   //if statement
    }  //for j
    } //for i 
}

$scope.deleteSlotDetails = function(pid,id){

$scope.checksheetdata[pid][id] = null;
$scope.checksheetdata[pid][id] = {};

}

 $scope.modifySlot = function(pid,id) {

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
