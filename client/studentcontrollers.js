// Student controller that handles student dashboard and student operation
angular.module('smApp').controller('studentController',
  ['$scope', '$routeParams','$location', 'notificationFactory', 'AuthService','$http', 
   function ($scope, $routeParams,$location, notificationFactory, AuthService,$http) {

      //Instantiates templateURL for dashboard constant at parent scope so subsequent child
        //controllers can modify it

        $scope.templateURL = 'partials/studentsummary.html';
        // $scope.templateURL = 'partials/student.html';
        //Get username and type at parent scope
        $scope.username = AuthService.getusername();
        $scope.lastname = AuthService.getlastname();
        $scope.usertype = AuthService.getusertype();
        $scope.student_id =  AuthService.getuserid();
        //Method to modify templateURL 
        $scope.settemplateURL = function(temp) {
            $scope.templateURL = temp;
        };

         $scope.indextoHR = function(index){
        return [((Math.floor(index/4))+1),((index%4)*15)];
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
                      
                        $scope.data = [];
                        $scope.yourdata = [
                        {
                            key: "Completed",
                            y: 0
                        },
                        {
                            key: "Remaining",
                            y: $scope.checksheets[0].credits
                        }
                    ];
                $scope.studentappts = function(){
                for (var key in $scope.advisors[0].appointmentTimes) {
                if ($scope.advisors[0].appointmentTimes.hasOwnProperty(key)) {
                    for (i = 0; i < $scope.advisors[0].appointmentTimes[key].length; i++) {
                    if(!angular.isUndefinedOrNull($scope.advisors[0].appointmentTimes[key][i])){
                        if(!angular.isUndefinedOrNull($scope.advisors[0].appointmentTimes[key][i].studentid)){
                                for (j = 0; j < $scope.advisors[0].appointmentTimes[key][i].studentid.length; j++) {
                                    if($scope.advisors[0].appointmentTimes[key][i].studentid[j]==AuthService.getuserid()){
                         
                                    return 'Appointment requested with '+ $scope.advisors[0].firstname +' ' + $scope.advisors[0].lastname+' from '+ $scope.indextoHR(i)[0] + ':' + $scope.indextoHR(i)[1] + ' to '+$scope.indextoHR(i+1)[0] + ':' + $scope.indextoHR(i+1)[1]+'.';

                                    }
                                }console.log('worked');
                        }
                    }

                    }
                  
                     }
                }
                return 'none';
            }
            $scope.studentappt = $scope.studentappts();
            $scope.setstudentappt = function(val){
                $scope.studentappt = val;
            }




                    for (i = 0; i < $scope.student.checksheetdata[0].length; i++) {
                    for (j = 0; j < $scope.student.checksheetdata[0][i].length; j++) {
                    if(!angular.isUndefinedOrNull($scope.student.checksheetdata[0][i][j])){
                            if(!angular.isUndefinedOrNull($scope.student.checksheetdata[0][i][j].suffix)){
                                if(!angular.isUndefinedOrNull($scope.student.checksheetdata[0][i][j].credits)){
                                $scope.yourdata[0].y = $scope.yourdata[0].y + $scope.student.checksheetdata[0][i][j].credits;
                                $scope.yourdata[1].y = $scope.yourdata[1].y - $scope.student.checksheetdata[0][i][j].credits;
                                }
                            else
                            {
                            $scope.yourdata[0].y = $scope.yourdata[0].y + 3;
                            $scope.yourdata[1].y = $scope.yourdata[1].y - 3;
                            }
                            }
                            // else
                            // {

                            // }
                        }
                        }
                        }

                        for (i = 0; i < $scope.checksheets[0].blockid.length; i++) {
                        
                        $scope.data[i] = {};
                        $scope.data[i].key = $scope.checksheets[0].blockid[i].name;
                        $scope.data[i].y = $scope.checksheets[0].blockid[i].credits;
                        }


                        console.log('scopedate: '+$scope.data);


                        if(!$scope.student.registered){
                            notificationFactory.warning("First time login detected. Change your password to proceed.");
                            $scope.templateURL = "partials/studentsettings.html"
                        }
                        else{
                             // $scope.settemplateURL("partials/studentrequestadvising.html");
                             $scope.templateURL = "partials/studentsummary.html"
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


   // for (i = 0; i < $scope.student.checksheetdata[0].length; i++) {
   //                  for (j = 0; j < $scope.student.checksheetdata[0][i].length; j++) {
   //                  if(!angular.isUndefinedOrNull($scope.student.checksheetdata[0][i][j])){
   //                          if(!angular.isUndefinedOrNull($scope.student.checksheetdata[0][i][j].suffix)){
   //                          $scope.yourdata[0].y = $scope.yourdata[0].y + 1;
   //                          $scope.yourdata[1].y = $scope.yourdata[1].y - 1;
   //                          }
   //                          // else
   //                          // {

   //                          // }
   //                      }
   //                      }
   //                      }






}]);

// Student controller that handles student dashboard and student operation
angular.module('smApp').controller('studentprofilecontroller',
  ['$scope', '$routeParams','$location', 'notificationFactory', 'AuthService','$http','$uibModal', 
   function ($scope, $routeParams,$location, notificationFactory, AuthService,$http,$uibModal) {


   $http({
                  method: 'POST',
                  url: '/studentprofile',
                  data: {
                        _id: AuthService.getuserid()
                    }
                    }).success(function(data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available

                        $scope.studentprofile = data;
                    })
                    .error(function(data, status, headers, config) {
                        notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
                    });


}]);




// Student controller that handles student dashboard and student operation
angular.module('smApp').controller('studentsummarycontroller',
  ['$scope', '$routeParams','$location', 'notificationFactory', 'AuthService','$http','$uibModal', 
   function ($scope, $routeParams,$location, notificationFactory, AuthService,$http,$uibModal) {

  $scope.options = {
            chart: {
                type: 'pieChart',
                height: 500,
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: true,
                duration: 500,
                labelThreshold: 0.01,
                labelSunbeamLayout: true,

                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 5,
                        left: 0
                    }
                }
            }
        };



}]);



// Student controller that handles student dashboard and student operation
angular.module('smApp').controller('studentadvisingappointmentController',
  ['$scope', '$routeParams','$location', 'notificationFactory', 'AuthService','$http','$uibModal', 
   function ($scope, $routeParams,$location, notificationFactory, AuthService,$http,$uibModal) {







$scope.date = new Date();
$scope.newdate = $scope.date.setDate($scope.date.getDate() - 41);

$scope.converInt = function(idx){
    return (Math.floor(idx/4)+1);
}


$scope.divshow = '0'; 

 // var d = new Date();
 // d.setDate(d.getDate()-5);
$scope.todayfullDay = new Date();
$scope.today = new Date().getDay();
$scope.lastweekBegin = new Date();


//8 instead of  7 cuz 1 is being added later
$scope.lastweekBegin = new Date($scope.lastweekBegin.setDate($scope.lastweekBegin.getDate() - (8+ ($scope.today))));
// $scope.dateArray = new Array(4);
$scope.dateArray = new Array(4);
$scope.dateArray[0] = new Array(7);
$scope.dateArray[1] = new Array(7);
$scope.dateArray[2] = new Array(7);
$scope.dateArray[3] = new Array(7);


for (var a = 0; a < 4; a++) {
for (var b = 0; b < 7; b++) {

$scope.dateArray[a][b] =($scope.lastweekBegin);
$scope.lastweekBegin = new Date($scope.lastweekBegin.setDate($scope.lastweekBegin.getDate() +1));

}
}

// This might need change
$scope.findifSlotTaken = function(datetocheck,hour,a,b){
$scope.green = 0;
  if(angular.isUndefinedOrNull(hour)) {
//     console.log('this is for primary undefined: '+a + ' and '+ b );
// console.log('yes hour is :  '+hour);
   $scope.green = 0; }

else
{
for(j=0;j<hour.length;j++){
  if((datetocheck.getDate() == new Date(hour[j]).getDate()) && (datetocheck.getMonth()) == new Date(hour[j]).getMonth()){
    // console.log('this is for: '+a + ' and '+ b ); 
    // console.log('first day: ' + new Date(hour[j]).getDate() + 'second day: ' +datetocheck.getDate()+ 'first month: '+new Date(hour[j]).getMonth()+'second month: '+datetocheck.getMonth())
    // console.log('MATCHED');  
    return '1';
} // Main if else  

}

// console.log(datetocheck.getDate() + ' vs '+ new Date(hour[j]).getDate());
// console.log(datetocheck.getMonth() + ' vs '+ new Date(hour[j]).getMonth());
// console.log(datetocheck.getDate()==new Date(hour[j]).getDate());
// console.log(datetocheck.getMonth()==new Date(hour[j]).getMonth());
// console.log('first day: ' + new Date(hour[0]).getDate() + 'second day: ' +datetocheck.getDate()+ 'first month: '+new Date(hour[0]).getMonth()+'second month: '+datetocheck.getMonth())
//      console.log('UNMATCHED');  
// console.log('return in else outside for each -->this is for: '+a + ' and '+ b );
   // return '0';
}
$scope.green  = $scope.green * 2;
// console.log('this is for everything fails: '+a + ' and '+ b );
// console.log('scope green  '+a + ' and '+ $scope.green );
// console.log(' unmatched date cuz: '+ datetocheck.getDate() + ' and '+ new Date(hour[0]).getDate());
// console.log('unmatched day cuz: '+ datetocheck.getMonth() + ' and '+ new Date(hour[0]).getMonth());
// console.log( datetocheck.getDate() == new Date(hour[0]).getDate());
// console.log( datetocheck.getMonth() == new Date(hour[0]).getMonth());
// console.log('final:' + ((datetocheck.getDate() == new Date(hour[0]).getDate()) && (datetocheck.getMonth()) == new Date(hour[0]).getMonth()));



return $scope.green;
}

// //TODO: UNCOMMENT BELOW TWO LINE WHEN DONE??
// $scope.advisortoview = 0;
// $scope.divshow = '1';

//Val to check if student can submit an appointment slot to database
// Initialized to 0 aka cannot submit by default
$scope.studentsaveSubmit = '0';
$scope.setstudentsaveSubmit = function(val){
  $scope.studentsaveSubmit  = val;
};


//Watch for changes in bloc description
$scope.$watch('templateURL', function(newVal, oldVal) {
if(oldVal=="partials/studentrequestadvising.html" &&  newVal!="partials/studentrequestadvising.html" && $scope.studentsaveSubmit=='1'){
  $confirm({text: 'You are about to go to a different tab. Did you want to save the changes on your checksheet?', title: 'Save changes to checksheet', ok: 'Save changes', cancel: 'No'})
        .then(function() {
          $scope.submitAppointmentrequest();
        });

}
});
//Val to check if student can submit an appointment slot intialized when loaded
// Value is 1 aka true when loaded
$scope.studentcanSubmit = '1';
$scope.setstudentsubmit = function(val){
  $scope.studentcanSubmit  = val;
};

 $scope.idxtohr = function(index){
        return [((Math.floor((index%97)/4))+1),(((index%96)%4)*15)];
     }


$scope.setdivshowtrue = function(val){

// $scope.advisors[$scope.advisortoview].appointmentTimes

// Should be this if you were a good programmer
// $scope.advisortimes = new Array($scope.advisors[val].appointmentTimes.length/4); 
$scope.advisortimes = new Array(24);

$scope.currentstudentdata = {};
// $scope.advisortimes = $scope.advisors[val].appointmentTimes;
$scope.advisortoview = val;
$scope.divshow = '1'; 

console.log($scope.advisors[val].appointmentTimes);
for (var i = 0; i < 24; i++) {

$scope.advisortimes[i] = new Array();

$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['S'][(i*4)]);
$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['S'][(i*4)+1]);
$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['S'][(i*4)+2]);
$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['S'][(i*4)+3]);

if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['S'][(i*4)])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['S'][(i*4)].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['S'][(i*4)].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['S'][(i*4)].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['S'][(i*4)].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['S'][(i*4)].note[x];
  $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['S'][(i*4)].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr(i*4)[0] + ':'+$scope.idxtohr(i*4)[1] + ' to '+$scope.idxtohr((i*4)+1)[0] + ':'+ $scope.idxtohr((i*4)+1)[1];
}
}


} }


if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['S'][(i*4)+1])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['S'][(i*4)+1].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['S'][(i*4)+1].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['S'][(i*4)+1].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['S'][(i*4)+1].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['S'][(i*4)+1].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['S'][(i*4)+1].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr((i*4)+1)[0] + ':'+$scope.idxtohr((i*4)+1)[1] + ' to '+$scope.idxtohr((i*4)+2)[0] + ':'+ $scope.idxtohr((i*4)+2)[1];
}
}
} }

if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['S'][(i*4)+2])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['S'][(i*4)+2].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['S'][(i*4)+2].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['S'][(i*4)+2].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['S'][(i*4)+2].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['S'][(i*4)+2].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['S'][(i*4)+2].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr((i*4)+2)[0] + ':'+$scope.idxtohr((i*4)+2)[1] + ' to '+$scope.idxtohr((i*4)+3)[0] + ':'+ $scope.idxtohr((i*4)+3)[1];
}
}
} }

if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['S'][(i*4)+3])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['S'][(i*4)+3].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['S'][(i*4)+3].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['S'][(i*4)+3].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['S'][(i*4)+3].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['S'][(i*4)+3].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['S'][(i*4)+3].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr((i*4)+3)[0] + ':'+$scope.idxtohr((i*4)+3)[1] + ' to '+$scope.idxtohr((i*4)+4)[0] + ':'+ $scope.idxtohr((i*4)+4)[1];
}
}
} }



$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['M'][(i*4)]);
$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['M'][(i*4)+1]);
$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['M'][(i*4)+2]);
$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['M'][(i*4)+3]);

if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['M'][(i*4)])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['M'][(i*4)].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['M'][(i*4)].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['M'][(i*4)].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['M'][(i*4)].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['M'][(i*4)].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['M'][(i*4)].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr(i*4)[0] + ':'+$scope.idxtohr(i*4)[1] + ' to '+$scope.idxtohr((i*4)+1)[0] + ':'+ $scope.idxtohr((i*4)+1)[1];
}
}
} }


if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['M'][(i*4)+1])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['M'][(i*4)+1].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['M'][(i*4)+1].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['M'][(i*4)+1].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['M'][(i*4)+1].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['M'][(i*4)+1].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['M'][(i*4)+1].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr((i*4)+1)[0] + ':'+$scope.idxtohr((i*4)+1)[1] + ' to '+$scope.idxtohr((i*4)+2)[0] + ':'+ $scope.idxtohr((i*4)+2)[1];

}
}
} }

if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['M'][(i*4)+2])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['M'][(i*4)+2].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['M'][(i*4)+2].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['M'][(i*4)+2].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['M'][(i*4)+2].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['M'][(i*4)+2].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['M'][(i*4)+2].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr((i*4)+2)[0] + ':'+$scope.idxtohr((i*4)+2)[1] + ' to '+$scope.idxtohr((i*4)+3)[0] + ':'+ $scope.idxtohr((i*4)+3)[1];
}
}
} }

if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['M'][(i*4)+3])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['M'][(i*4)+3].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['M'][(i*4)+3].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['M'][(i*4)+3].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['M'][(i*4)+3].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['M'][(i*4)+3].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['M'][(i*4)+3].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr((i*4)+3)[0] + ':'+$scope.idxtohr((i*4)+3)[1] + ' to '+$scope.idxtohr((i*4)+4)[0] + ':'+ $scope.idxtohr((i*4)+4)[1];
}
}
} }

$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['T'][(i*4)]);
$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['T'][(i*4)+1]);
$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['T'][(i*4)+2]);
$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['T'][(i*4)+3]);

if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['T'][(i*4)])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['T'][(i*4)].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['T'][(i*4)].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['T'][(i*4)].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['T'][(i*4)].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['T'][(i*4)].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['T'][(i*4)].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr(i*4)[0] + ':'+$scope.idxtohr(i*4)[1] + ' to '+$scope.idxtohr((i*4)+1)[0] + ':'+ $scope.idxtohr((i*4)+1)[1];
}
}
} }


if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['T'][(i*4)+1])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['T'][(i*4)+1].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['T'][(i*4)+1].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['T'][(i*4)+1].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['T'][(i*4)+1].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['T'][(i*4)+1].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['T'][(i*4)+1].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr((i*4)+1)[0] + ':'+$scope.idxtohr((i*4)+1)[1] + ' to '+$scope.idxtohr((i*4)+2)[0] + ':'+ $scope.idxtohr((i*4)+2)[1];

}
}
} }

if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['T'][(i*4)+2])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['T'][(i*4)+2].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['T'][(i*4)+2].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['T'][(i*4)+2].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['T'][(i*4)+2].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['T'][(i*4)+2].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['T'][(i*4)+2].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr((i*4)+2)[0] + ':'+$scope.idxtohr((i*4)+2)[1] + ' to '+$scope.idxtohr((i*4)+3)[0] + ':'+ $scope.idxtohr((i*4)+3)[1];
}
}
} }

if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['T'][(i*4)+3])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['T'][(i*4)+3].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['T'][(i*4)+3].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['T'][(i*4)+3].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['T'][(i*4)+3].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['T'][(i*4)+3].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['T'][(i*4)+3].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr((i*4)+3)[0] + ':'+$scope.idxtohr((i*4)+3)[1] + ' to '+$scope.idxtohr((i*4)+4)[0] + ':'+ $scope.idxtohr((i*4)+4)[1];
}
}
} }


$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['W'][(i*4)]);
$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['W'][(i*4)+1]);
$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['W'][(i*4)+2]);
$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['W'][(i*4)+3]);

if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['W'][(i*4)])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['W'][(i*4)].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['W'][(i*4)].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['W'][(i*4)].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['W'][(i*4)].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['W'][(i*4)].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['W'][(i*4)].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr(i*4)[0] + ':'+$scope.idxtohr(i*4)[1] + ' to '+$scope.idxtohr((i*4)+1)[0] + ':'+ $scope.idxtohr((i*4)+1)[1];

}
}
} }


if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['W'][(i*4)+1])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['W'][(i*4)+1].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['W'][(i*4)+1].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['W'][(i*4)+1].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['W'][(i*4)+1].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['W'][(i*4)+1].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['W'][(i*4)+1].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr((i*4)+1)[0] + ':'+$scope.idxtohr((i*4)+1)[1] + ' to '+$scope.idxtohr((i*4)+2)[0] + ':'+ $scope.idxtohr((i*4)+2)[1];

}
}
} }

if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['W'][(i*4)+2])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['W'][(i*4)+2].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['W'][(i*4)+2].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['W'][(i*4)+2].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['W'][(i*4)+2].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['W'][(i*4)+2].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['W'][(i*4)+2].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr((i*4)+2)[0] + ':'+$scope.idxtohr((i*4)+2)[1] + ' to '+$scope.idxtohr((i*4)+3)[0] + ':'+ $scope.idxtohr((i*4)+3)[1];
}
}
} }

if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['W'][(i*4)+3])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['W'][(i*4)+3].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['W'][(i*4)+3].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['W'][(i*4)+3].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['W'][(i*4)+3].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['W'][(i*4)+3].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['W'][(i*4)+3].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr((i*4)+3)[0] + ':'+$scope.idxtohr((i*4)+3)[1] + ' to '+$scope.idxtohr((i*4)+4)[0] + ':'+ $scope.idxtohr((i*4)+4)[1];
}
}
} }

$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['TH'][(i*4)]);
$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['TH'][(i*4)+1]);
$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['TH'][(i*4)+2]);
$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['TH'][(i*4)+3]);

if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['TH'][(i*4)])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['TH'][(i*4)].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['TH'][(i*4)].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['TH'][(i*4)].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['TH'][(i*4)].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['TH'][(i*4)].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['TH'][(i*4)].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr(i*4)[0] + ':'+$scope.idxtohr(i*4)[1] + ' to '+$scope.idxtohr((i*4)+1)[0] + ':'+ $scope.idxtohr((i*4)+1)[1];
}
}
} }


if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['TH'][(i*4)+1])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['TH'][(i*4)+1].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['TH'][(i*4)+1].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['TH'][(i*4)+1].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['TH'][(i*4)+1].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['TH'][(i*4)+1].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['TH'][(i*4)+1].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr((i*4)+1)[0] + ':'+$scope.idxtohr((i*4)+1)[1] + ' to '+$scope.idxtohr((i*4)+2)[0] + ':'+ $scope.idxtohr((i*4)+2)[1];

}
}
} }

if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['TH'][(i*4)+2])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['TH'][(i*4)+2].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['TH'][(i*4)+2].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['TH'][(i*4)+2].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['TH'][(i*4)+2].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['TH'][(i*4)+2].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['TH'][(i*4)+2].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr((i*4)+2)[0] + ':'+$scope.idxtohr((i*4)+2)[1] + ' to '+$scope.idxtohr((i*4)+3)[0] + ':'+ $scope.idxtohr((i*4)+3)[1];
}
}
} }

if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['TH'][(i*4)+3])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['TH'][(i*4)+3].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['TH'][(i*4)+3].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['TH'][(i*4)+3].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['TH'][(i*4)+3].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['TH'][(i*4)+3].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['TH'][(i*4)+3].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr((i*4)+3)[0] + ':'+$scope.idxtohr((i*4)+3)[1] + ' to '+$scope.idxtohr((i*4)+4)[0] + ':'+ $scope.idxtohr((i*4)+4)[1];
}
}
} }


$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['F'][(i*4)]);
$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['F'][(i*4)+1]);
$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['F'][(i*4)+2]);
$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['F'][(i*4)+3]);

if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['F'][(i*4)])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['F'][(i*4)].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['F'][(i*4)].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['F'][(i*4)].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['F'][(i*4)].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['F'][(i*4)].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['F'][(i*4)].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr(i*4)[0] + ':'+$scope.idxtohr(i*4)[1] + ' to '+$scope.idxtohr((i*4)+1)[0] + ':'+ $scope.idxtohr((i*4)+1)[1];
}
}
} }


if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['F'][(i*4)+1])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['F'][(i*4)+1].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['F'][(i*4)+1].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['F'][(i*4)+1].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['F'][(i*4)+1].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['F'][(i*4)+1].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['F'][(i*4)+1].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr((i*4)+1)[0] + ':'+$scope.idxtohr((i*4)+1)[1] + ' to '+$scope.idxtohr((i*4)+2)[0] + ':'+ $scope.idxtohr((i*4)+2)[1];

}
}
} }

if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['F'][(i*4)+2])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['F'][(i*4)+2].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['F'][(i*4)+2].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['F'][(i*4)+2].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['F'][(i*4)+2].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['F'][(i*4)+2].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['F'][(i*4)+2].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr((i*4)+2)[0] + ':'+$scope.idxtohr((i*4)+2)[1] + ' to '+$scope.idxtohr((i*4)+3)[0] + ':'+ $scope.idxtohr((i*4)+3)[1];
}
}
} }

if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['F'][(i*4)+3])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['F'][(i*4)+3].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['F'][(i*4)+3].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['F'][(i*4)+3].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['F'][(i*4)+3].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['F'][(i*4)+3].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['F'][(i*4)+3].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr((i*4)+3)[0] + ':'+$scope.idxtohr((i*4)+3)[1] + ' to '+$scope.idxtohr((i*4)+4)[0] + ':'+ $scope.idxtohr((i*4)+4)[1];
}
}
} }


$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['SA'][(i*4)]);
$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['SA'][(i*4)+1]);
$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['SA'][(i*4)+2]);
$scope.advisortimes[i].push($scope.advisors[val].appointmentTimes['SA'][(i*4)+3]);

if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['SA'][(i*4)])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['SA'][(i*4)].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['SA'][(i*4)].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['SA'][(i*4)].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['SA'][(i*4)].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['SA'][(i*4)].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['SA'][(i*4)].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr(i*4)[0] + ':'+$scope.idxtohr(i*4)[1] + ' to '+$scope.idxtohr((i*4)+1)[0] + ':'+ $scope.idxtohr((i*4)+1)[1];
}
}
} }


if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['SA'][(i*4)+1])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['SA'][(i*4)+1].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['SA'][(i*4)+1].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['SA'][(i*4)+1].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['SA'][(i*4)+1].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['SA'][(i*4)+1].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['SA'][(i*4)+1].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr((i*4)+1)[0] + ':'+$scope.idxtohr((i*4)+1)[1] + ' to '+$scope.idxtohr((i*4)+2)[0] + ':'+ $scope.idxtohr((i*4)+2)[1];

}
}
} }

if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['SA'][(i*4)+2])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['SA'][(i*4)+2].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['SA'][(i*4)+2].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['SA'][(i*4)+2].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['SA'][(i*4)+2].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['SA'][(i*4)+2].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['SA'][(i*4)+2].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr((i*4)+2)[0] + ':'+$scope.idxtohr((i*4)+2)[1] + ' to '+$scope.idxtohr((i*4)+3)[0] + ':'+ $scope.idxtohr((i*4)+3)[1];
}
}
} }

if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['SA'][(i*4)+3])))
{
if(!(angular.isUndefinedOrNull($scope.advisors[val].appointmentTimes['SA'][(i*4)+3].studentid))){
for(var x=0;x<$scope.advisors[val].appointmentTimes['SA'][(i*4)+3].studentid.length;x++){
if($scope.advisors[val].appointmentTimes['SA'][(i*4)+3].studentid[x] == AuthService.getuserid()){
   $scope.setstudentsubmit('0'); 
   $scope.currentstudentdata.appointmentDate = $scope.advisors[val].appointmentTimes['SA'][(i*4)+3].appointmentDate[x];
   $scope.currentstudentdata.note = $scope.advisors[val].appointmentTimes['SA'][(i*4)+3].note[x];
    $scope.currentstudentdata.appointmentRequestTime = $scope.advisors[val].appointmentTimes['SA'][(i*4)+3].appointmentRequestTime[x];
$scope.currentstudentdata.appointmentTime = $scope.idxtohr((i*4)+3)[0] + ':'+$scope.idxtohr((i*4)+3)[1] + ' to '+$scope.idxtohr((i*4)+4)[0] + ':'+ $scope.idxtohr((i*4)+4)[1];
}
}
} }




}

// console.table($scope.advisortimes);
// console.log($scope.advisortimes.length);

}


$scope.indextotime = function(idx){

    if(idx==0 || idx==24){
    return '12 AM';    
    }
    else if(idx ==12){
    return '12 PM';      
    }
    else if(idx <12){
    return idx + ' AM';       
    }
    else
    {
    return idx%12 + ' PM';   
    }

}


$scope.apptslotclick = function(hourinDay,timeSlotandDay,dateday,slotclass){

          var modalInstance = $uibModal.open({
                templateUrl: 'partials/apptmakermodal.html',
                controller: 'apptmakerController',
                scope: $scope,
                resolve: {
                    hourinDay: function() {
                        return hourinDay;
                    },
                    timeSlotandDay: function() {
                        return timeSlotandDay;
                    },
                    dateday: function() {
                        return dateday;
                    },
                    slotclass: function() {
                        return slotclass;
                    }

                }
            });

}


$scope.submitAppointmentrequest = function(){
      //Add blocks to the database
      $scope.setstudentsaveSubmit('0');
        $scope.setstudentappt($scope.studentappts());
            $http({
                    method: 'POST',
                    url: '/requestappointment',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        appointmentTimes: $scope.advisors[$scope.advisortoview].appointmentTimes,
                        _id: $scope.advisors[$scope.advisortoview]._id
                    }

                }).success(function(data, status, headers, config) {
                 //Template will be set to show new advisors once addadvisor has been completed
               $scope.settemplateURL('partials/studentsummary.html');
               notificationFactory.info("Successfully made appointment request! ");
                })
                .error(function(data, status, headers, config) {
                    notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")

                });
}

 }]);


angular.module('smApp').controller('apptmakerController',
  ['$scope', '$location', 'notificationFactory', 'AuthService','$http','$uibModalInstance','hourinDay','timeSlotandDay','dateday','slotclass', 
   function ($scope, $location, notificationFactory, AuthService,$http,$uibModalInstance,hourinDay,timeSlotandDay,dateday,slotclass) {

$scope.hourinDay = hourinDay;
$scope.timeSlotandDay = timeSlotandDay;
$scope.dateday = dateday;
$scope.appointmentEdit = {};
$scope.buttondisabled = true;
$scope.slotclass = slotclass;
console.log('hour in day + ');
console.log();
console.log();


$scope.unlockSubmit = function(){

    $scope.buttondisabled = !$scope.buttondisabled
}




$scope.submitappointmentrequest = function(day,index,hourinDay,timeSlotandDay){
   $scope.setstudentsubmit('0'); 
   $scope.setstudentsaveSubmit('1');


console.log('slot B44:'+$scope.findifSlotTaken($scope.dateday));

if(angular.isUndefinedOrNull($scope.advisors[$scope.advisortoview].appointmentTimes[day][index].note)){
$scope.advisors[$scope.advisortoview].appointmentTimes[day][index].note = new Array();
$scope.advisortimes[hourinDay][timeSlotandDay].note = new Array();
$scope.advisors[$scope.advisortoview].appointmentTimes[day][index].studentid = new Array();
$scope.advisortimes[hourinDay][timeSlotandDay].studentid = new Array();
$scope.advisors[$scope.advisortoview].appointmentTimes[day][index].appointmentDate = new Array();
$scope.advisortimes[hourinDay][timeSlotandDay].appointmentDate = new Array();
$scope.advisors[$scope.advisortoview].appointmentTimes[day][index].appointmentRequestTime = new Array();
$scope.advisortimes[hourinDay][timeSlotandDay].appointmentRequestTime = new Array();
}

//Debug: This line might be needed later
// $scope.advisortimes[hourinDay][timeSlotandDay].note.push($scope.appointmentEdit.note);
// $scope.advisortimes[hourinDay][timeSlotandDay].note.push(AuthService.getuserid());
// $scope.advisortimes[hourinDay][timeSlotandDay].note.push($scope.todayfullDay);
// $scope.advisortimes[hourinDay][timeSlotandDay].note.push($scope.dateday);

$scope.advisors[$scope.advisortoview].appointmentTimes[day][index].note.push($scope.appointmentEdit.note);
$scope.advisors[$scope.advisortoview].appointmentTimes[day][index].studentid.push(AuthService.getuserid());
$scope.advisors[$scope.advisortoview].appointmentTimes[day][index].appointmentRequestTime.push($scope.todayfullDay);
$scope.advisors[$scope.advisortoview].appointmentTimes[day][index].appointmentDate.push($scope.dateday);

// $scope.advisors[$scope.advisortoview].appointmentTimes[day][index].note.push($scope.appointmentNote);
// $scope.advisortimes[hourinDay][timeSlotandDay].note.push($scope.appointmentNote);
$uibModalInstance.dismiss('cancel');

console.log('slot should be taken now:'+$scope.findifSlotTaken($scope.dateday));

}


$scope.hourinDay = hourinDay;
$scope.timeSlotandDay = timeSlotandDay;
// console.log(JSON.stringify($scope.advisortimes));
$scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

$scope.indextodayarray = function(a,b){
    return ((parseInt(a)*4)+(Math.floor(b%4)));
}
  $scope.indextoday = function(idx){
    $scope.switchindex = (Math.floor(idx/4));

console.log($scope.switchindex)
    switch($scope.switchindex) {
    case 0:
        return 'S';
    case 1:
        return 'M';
    case 2:
        return 'T';
    case 3:
        return 'W';
    case 4:
        return 'TH';
    case 5:
        return 'F';
    case 6:
        return 'SA';
    }

  }

 }]);





angular.module('smApp').controller('viewSlotInfoController',
  ['$scope', '$location', 'notificationFactory', 'AuthService','$http','$uibModalInstance','pid','id', 
   function ($scope, $location, notificationFactory, AuthService,$http,$uibModalInstance,pid,id) {

$scope.pid = pid;
$scope.id = id;

$scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
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
angular.module('smApp').controller('studentviewchecksheetcontroller',
  ['$scope', '$location', 'notificationFactory', 'AuthService','$http','$uibModal','$confirm', 
   function ($scope, $location, notificationFactory, AuthService,$http,$uibModal,$confirm) {


$scope.printchecksheet = function(){
    console.log("print checksheet.");

    var pdf = new jsPDF('l', 'pt', 'a4');
 var options = {
    pagesplit: true
};

pdf.addHTML($('#studentchecksheetdiv'), 0, 0, options, function(){
    pdf.save("test.pdf");
});

}




$scope.divshow = '0'; 
$scope.setdivshowtrue = function(val){ 
$scope.checksheetinview = $scope.checksheets[val];
$scope.checksheetinviewindex = val;
$scope.checksheetdata = $scope.student.checksheetdata[$scope.checksheetinviewindex];
$scope.divshow = '1'; 
$scope.complete = 0;
$scope.incomplete = 0;
$scope.blocksummarycomplete = new Array($scope.checksheetdata.length);
   for (i = 0;i<$scope.blocksummarycomplete.length; i++) {
    $scope.blocksummarycomplete[i] = 0;
   }
$scope.blocksummaryincomplete = new Array($scope.checksheetdata.length);
   for (i = 0;i<$scope.blocksummaryincomplete.length; i++) {
    $scope.blocksummaryincomplete[i] = 0;
   }

console.log(JSON.stringify($scope.checksheetdata));
   for (i = 0;i<$scope.checksheetdata.length; i++) {

    for (j = 0;j<$scope.checksheetdata[i].length; j++) {
        if (!angular.isUndefinedOrNull($scope.checksheetdata[i][j])) {
        if (!angular.isUndefinedOrNull($scope.checksheetdata[i][j].suffix)) {
        $scope.complete = $scope.complete+1;
         $scope.blocksummarycomplete[i] =  $scope.blocksummarycomplete[i] +1;
        }   //if statement
        else{
        $scope.incomplete = $scope.incomplete+1;
        $scope.blocksummaryincomplete[i] = $scope.blocksummaryincomplete[i] +1;
        }

        }//outer if
        else{
            $scope.incomplete = $scope.incomplete+1;
            $scope.blocksummaryincomplete[i] = $scope.blocksummaryincomplete[i] +1;
        }
    }  //for j
    } //for i 


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


}]);



// Student controller that handles modification of student checksheet
angular.module('smApp').controller('studentmodifychecksheetcontroller',
  ['$scope', '$location', 'notificationFactory', 'AuthService','$http','$uibModal','$confirm', 
   function ($scope, $location, notificationFactory, AuthService,$http,$uibModal,$confirm) {


$scope.submitcounter = 0;

//Watch for changes in bloc description
$scope.$watch('templateURL', function(newVal, oldVal) {

if(oldVal=="partials/studentmodifychecksheet.html" &&  newVal!="partials/studentmodifychecksheet.html" && $scope.divshow=='1' && $scope.submitcounter=='0'){
  

  $confirm({text: 'You are about to go to a different tab. Did you want to save the changes on your checksheet?', title: 'Save changes to checksheet', ok: 'Save changes', cancel: 'No'})
        .then(function() {
          $scope.submitchecksheetdata();
        });
}

});


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

$scope.submitchecksheetdata = function () {
$scope.submitcounter = 1;
    for (i = 0;i<$scope.checksheetdata.length; i++) {
    for (j = 0;j<$scope.checksheetdata[i].length; j++) {
        if (!angular.isUndefinedOrNull($scope.checksheetdata[i][j])) {
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
        }//outer if
    }  //for j
    } //for i 
    console.log(JSON.stringify($scope.checksheetdata));


// myIndex['checksheetdata.' + req.body.checksheetinviewindex] = req.body.checksheetdata;

//  models.student.update({_id: req.body._id },
         // {$set: myIndex}).exec(function(err, items) {
       $http({
                        method: 'POST',
                        url: '/checksheetdata',
                          headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        _id: AuthService.getuserid(),
                        checksheetinviewindex: $scope.checksheetinviewindex,
                        checksheetdata: $scope.checksheetdata
                    }

                    }).success(function(data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                    //      $scope.yourdata = [
                    //     {
                    //         key: "Completed",
                    //         y: 0
                    //     },
                    //     {
                    //         key: "Remaining",
                    //         y: $scope.checksheets[0].credits
                    //     }
                    // ];
                    $scope.yourdata[0].y = 0;
                    $scope.yourdata[1].y = $scope.checksheets[0].credits;
                    for (i = 0; i < $scope.student.checksheetdata[0].length; i++) {
                    for (j = 0; j < $scope.student.checksheetdata[0][i].length; j++) {
                    if(!angular.isUndefinedOrNull($scope.student.checksheetdata[0][i][j])){
                            if(!angular.isUndefinedOrNull($scope.student.checksheetdata[0][i][j].suffix)){
                                if(!angular.isUndefinedOrNull($scope.student.checksheetdata[0][i][j].credits)){
                                $scope.yourdata[0].y = $scope.yourdata[0].y + $scope.student.checksheetdata[0][i][j].credits;
                                $scope.yourdata[1].y = $scope.yourdata[1].y - $scope.student.checksheetdata[0][i][j].credits;
                                }
                            else
                            {
                            $scope.yourdata[0].y = $scope.yourdata[0].y + 3;
                            $scope.yourdata[1].y = $scope.yourdata[1].y - 3;
                            }
                            }
                            // else
                            // {

                            // }
                        }
                        }
                        }


                    notificationFactory.success("Checksheetdata updated!");
                    $scope.settemplateURL("partials/studentsummary.html");

                    })
                    .error(function(data, status, headers, config) {
                        notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
                    });


//LINE NUMBER 427    
// router.post('/', function(req, res) {

}

$scope.deleteSlotDetails = function(pid,id){

$scope.checksheetdata[pid][id] = null;
$scope.checksheetdata[pid][id] = {};

}






$scope.viewSlotInfo = function(pid,id){
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/viewSlotInfo.html',
                controller: 'viewSlotInfoController',
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
