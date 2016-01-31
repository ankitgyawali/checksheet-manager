
//Main Root Controller that handles root dashboard
angular.module('smApp').controller('advisorController', ['$scope', '$http', '$location', 'notificationFactory', 'AuthService', '$cookies',
    function($scope, $http, $location, notificationFactory, AuthService, $cookies) {

        //Instantiates templateURL for dashboard constant at parent scope so subsequent child
        //controllers can modify it
        // $scope.templateURL = 'partials/rdept.html';

        //DEBUG: set advisor default page here
        $scope.templateURL = 'partials/viewadvising.html';
        //Get username and type at parent scope
        $scope.username = AuthService.getusername();
        $scope.lastname = AuthService.getlastname()
        $scope.usertype = AuthService.getusertype();
    

     



               $http({
                        method: 'GET',
                        url: '/classes'

                    }).success(function(data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                        $scope.dpts = data.dpts;
                        $scope.courses = data.courses;
                        //console.log(JSON.stringify($scope.courses | suffix:135));
                         $http({
                        method: 'POST',
                        url: '/advisorstudentdetails',
                        data: {
                        _id: AuthService.getuserid()
                    }
                    }).success(function(data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available

                    $scope.studentlist = data.advisee;
                    $scope.myappointmentTimes = data.appointmentTimes;
                    

                        console.log(JSON.stringify($scope.myappointmentTimes));

                    })
                    .error(function(data, status, headers, config) {
                        notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
                    });


                    })
                    .error(function(data, status, headers, config) {
                        notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
                    });
        $scope.settemplateURL = function(temp) {
            $scope.templateURL = temp;
        };

        //Logout function that utilizes factory service 
        $scope.logout = function() {
            AuthService.logout();
            notificationFactory.info("Logged out succesfully!")
            $location.url('/login');
        };

    }
]);

//Controller that handles "manage advisor" dashboard page
angular.module('smApp').controller('viewadivisingrequests', ['$scope', '$location', 'notificationFactory', '$uibModal', '$http', 'AuthService',
    function($scope, $location, notificationFactory, $uibModal, $http, AuthService) {


  //Method to modify templateURL 
          $scope.hourtoIndex = function(hour,minutes){
      // console.log("hour:"+hour);
      // console.log("hour:"+minutes);
      return (((hour-1)*4) + (minutes/15));
   }

   $scope.indexTohour = function(index){
      return [((Math.floor(index/4))+1),((index%4)*15)];
   }


$scope.showtimes = function(time){
  $scope.starteend = new Array();

  if(!angular.isUndefinedOrNull(time)){
    for(var i = 0; i < time.length; i++){

      if (!angular.isUndefinedOrNull(time[i])) {
         if (!angular.isUndefinedOrNull(time[i]).state) {
    
         if((time[i].state=='true' && angular.isUndefinedOrNull(time[(((i-1) % 96) + 96) % 96])) || (time[i].state=='true' && angular.isUndefinedOrNull(time[(i+1)%96]))){

          $scope.starteend.push(i);
        } // main state true
         } //second state defined check
        } // slot is defined check
       
    } // for oop



 if(!angular.isUndefinedOrNull(time[0])){
 if(!angular.isUndefinedOrNull(time[95])){
  console.log('xxx');
    if(!angular.isUndefinedOrNull(time[0]).state){
     if(!angular.isUndefinedOrNull(time[95]).state){
      if((time[0]).state=='true' && (time[95]).state=='true'){
      $scope.starteend.push($scope.starteend[0]);
      $scope.starteend.splice(0, 1);
    }}
    }}}

if ($scope.starteend.length) {
  if ($scope.starteend.length==2) {

return '2 only';
  }else
  {
return 'laaang';
  };
    }else{
      return 'None';
    };
     
  } //main if statement




}

console.log($scope.myappointmentTimes);

 

$scope.ok = function(){
  console.log($scope.myappointmentTimes);
}


 }
]);


//Controller that handles "manage advisor" dashboard page
angular.module('smApp').controller('advisorviewstudents', ['$scope', '$location', 'notificationFactory', '$uibModal', '$http', 'AuthService',
    function($scope, $location, notificationFactory, $uibModal, $http, AuthService) {

   $scope.pageSize = AuthService.getPaginationSize();
        $scope.currentPage = 1;
        $scope.divshow = 1;
        //Watches pagesize to store value in factory
        $scope.$watch('pageSize', function(val) {

            AuthService.setPaginationSize(val);
        });

       


                  $scope.viewstudentchecksheet = function (checksheet, checksheetdata){
                    $scope.divshow = '0';
                    $scope.checksheetinview = checksheet;

                    $scope.checksheetdata = checksheetdata;

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


                    console.log('checksheet is '+ JSON.stringify($scope.checksheetinview));

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
 $scope.switchdiv = function(){
      $scope.divshow = '1';
 }

$scope.advisormodifystudent = function(student){

     //Use angularUI bootstrap module to instiate a modal so user can modify a department
        //This modal contains its own controller and templateURL. depID - the department to update
        //is passed to this modal as argument

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/advisormodifystudentmodal.html',
                controller: 'advisormodifystudentmodal',
                scope: $scope,
                resolve: {
                    student: function() {
                        return student;
                    }
                }
            });
              }



            $scope.showchecksheetinfo = function(checksheet){
                var modalInstance = $uibModal.open({
                templateUrl: 'partials/advisorviewchecksheetinfo.html',
                controller: 'advisorviewchecksheetinfo',
                scope: $scope,
                resolve: {
                    checksheet: function() {
                        return checksheet;
                    }
                }
            });

            }



      }
]);


angular.module('smApp').controller('advisormodifystudentmodal',
  ['$scope', '$location', 'notificationFactory', 'AuthService','$http','$uibModalInstance','student', 
   function ($scope, $location, notificationFactory, AuthService,$http,$uibModalInstance,student) {

//Deep copy of department object. This is because angular assigns stuff by reference by default
$scope.newstudentID = angular.copy(student);
$scope.studentName = $scope.newstudentID.name;


$scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };



//Delete department from database
$scope.delete = function () {
    $http({
            method: 'DELETE',
            url: '/existingstudent',
            // set the headers so angular passing info as form data (not request payload)
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                deleteID: student._id
            }

        }).success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            console.log("deleted: "+student._id);
            $uibModalInstance.dismiss('cancel');
            //$location.url('/root/dashboard');
            
             if (status === 200) {
              
            $scope.studentlist.splice($scope.studentlist.indexOf(student),1);
          notificationFactory.info("Successfully deleted student.");
            }

        })
        .error(function(data, status, headers, config) {

        $uibModalInstance.dismiss('cancel');
        notificationFactory.error("Error: Status Code "+status+". Contact admin if issue persists.")
        });


  };


// Modify department information on the database
$scope.modify = function () {
 // create a new instance of deferred
    $http({
            method: 'PUT',
            url: '/existingstudent',
            // set the headers so angular passing info as form data (not request payload)
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                newstudentID: $scope.newstudentID
            }

        }).success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            $uibModalInstance.dismiss('cancel');
            //$location.url('/root/dashboard');
            
             if (status === 200) {
                angular.copy($scope.newstudentID,student);

               notificationFactory.info("Successfully updated student");
            }

        })
        .error(function(data, status, headers, config) {

        $uibModalInstance.dismiss('cancel');
        notificationFactory.error("Error: Status Code "+status+". Contact admin if issue persists.")
        });
  };


 }]);


//Controller for modal to modify department
angular.module('smApp').controller('advisorviewchecksheetinfo',
  ['$scope','$uibModalInstance', 'checksheet', '$http', 'notificationFactory', '$location',
    function ($scope,$uibModalInstance, checksheet,$http,notificationFactory,$location) {

      $scope.checksheettoview = checksheet;


//Cancel modal for department
$scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };



     
  }
]);


//Controller that handles block creation for checksheet
angular.module('smApp').controller('blockController', ['$scope', '$http','$location', 'notificationFactory', 'AuthService', '$cookies',
    function($scope, $http, $location, notificationFactory, AuthService, $cookies) {
        
        //Default block json declared to to be added to the database
        $scope.block = {};
        $scope.block.creator = $scope.username + " " + $scope.lastname;
        $scope.block.creatorID = AuthService.getuserid();

        //Splice elective option from array
        $scope.removeoption = function (idx) {
            $scope.block.electivechoices.splice(idx,1)
        }

        //Array intialized to hold block details so that it can be bound to view
        $scope.block.details = [];
        //Default variables initialized to show changes in view
        $scope.divshow = true;

        //Build block function that creates array according to given number
        $scope.buildBlock = function (num){
             $scope.divshow = false;
             $scope.block.details = new Array(num);   
             $scope.block.electivechoices = [];
        };

        //Watch for change in length of block details
        $scope.$watch('block.details.length', function(val) {
            console.log(val);
             $scope.block.slot = val;
        });

        //Remove slot form block array
        $scope.removeslot = function (idx) {
            $scope.block.details.splice(idx,1);
        }
     
        //Add slot to block array
        $scope.addSlot = function (){
            $scope.block.details.length = $scope.block.details.length + 1;
          
          };
        
        //Add elective to block's elective choices       
       $scope.addelectiveoption = function (p,s) {
                $scope.block.electivechoices.push({
                    "prefix":p,
                    "suffix":s
                });
                console.log(JSON.stringify($scope.block.electivechoices));
                 console.log(JSON.stringify($scope.block.electivechoices.length));
            }

        //Adds slots to the blocks and submits it to the database
         $scope.submitSlot = function (){
          
        //Block json object is trimmed and made fit before submitting it to database by
        //changing structure according to block type and removing unnecessary attributes
        if ($scope.block.type != "Electives") {
                delete $scope.block.electivechoices;
            }
            $scope.block.credits = 0;
              angular.forEach($scope.block.details,function(value,index){
                if(value.rule=="None" || angular.isUndefined(value.rule) || value.rule === null ) { 
                delete value['rule'];
                delete value['ruleconstraint'];
                 }

                 if(value.prerequisite=="None" || angular.isUndefined(value.prerequisite) || value.prerequisite === null ) { 
                delete value['prerequisite'];
                delete value['prereqconstraint'];
                if(value.hascredit == "True"){  $scope.block.credits =  $scope.block.credits + 3; }
                }
            });
          
            //Add blocks to the database
            $http({
                    method: 'POST',
                    url: '/blocks',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        arraytoAdd: $scope.block
                    }

                }).success(function(data, status, headers, config) {
                 //Template will be set to show new advisors once addadvisor has been completed
                $scope.settemplateURL('partials/radvisor.html');
               notificationFactory.info("Successfully added block to database! ");
                })
                .error(function(data, status, headers, config) {
                    notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")

                });
          };

    }
]);

//Controller designed to handle mixing of one or more checksheet block for the creation of a checksheet
angular.module('smApp').controller('blockviewer', ['$scope', '$http','$uibModal', 'notificationFactory', 'AuthService', '$cookies',
    function($scope, $http, $uibModal, notificationFactory, AuthService, $cookies) {

          $http({
                    method: 'GET',
                    url: '/blocks'

                }).success(function(data, status, headers, config) {
                    // this callback will be called asynchronously
                    // when the response is available
                    $scope.blocks = data;

                })
                .error(function(data, status, headers, config) {
                notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
                });
                $scope.divshow = true;
                $scope.currentPage = 1;
                $scope.pageSize = AuthService.getPaginationSize();
                $scope.cancelsub = function(){
                    $scope.divshow = true;
                }
                $scope.modifyBlock = function(blkID) {
                    $scope.divshow = false;
                    $scope.currentBlock = blkID;
                    //Deep copy of department object. This is because angular assigns stuff by reference by default
                    $scope.newID = angular.copy(blkID);
                    $scope.blkName = $scope.newID.name;
                     };

                $scope.submitmodifiedBlock = function(){
                    
                      $http({
                    method: 'PUT',
                    url: '/blocks',
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
            
            
             if (status === 200) {
                angular.copy($scope.newID,$scope.currentBlock);

               notificationFactory.info("Successfully updated: "+$scope.newID.name)
                $scope.divshow = true;
            }

        })
        .error(function(data, status, headers, config) {

        notificationFactory.error("Error: Status Code "+status+". Contact admin if issue persists.")
        });
     }




  }
]);


//Controller for modal to modify department
angular.module('smApp').controller('checksheetModalController',
  ['$scope', '$filter','$uibModalInstance', 'chksID', '$http', 'notificationFactory', '$location',
    function ($scope,$filter,$uibModalInstance, chksID,$http,notificationFactory,$location) {

//Deep copy of department object. This is because angular assigns stuff by reference by default
$scope.newID = angular.copy(chksID);
$scope.chksName = $scope.newID.name;

//Cancel modal for department
$scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };


// Modify department information on the database
$scope.modify = function () {
 // create a new instance of deferred
    $http({
            method: 'PUT',
            url: '/checksheets',
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
                angular.copy($scope.newID,chksID);

               notificationFactory.info("Successfully updated: "+$scope.newID.name)
            }

        })
        .error(function(data, status, headers, config) {

        $uibModalInstance.dismiss('cancel');
        notificationFactory.error("Error: Status Code "+status+". Contact admin if issue persists.")
        });
  };

}]);



//Controller designed to handle mixing of one or more checksheet block for the creation of a checksheet
angular.module('smApp').controller('checksheetviewer', ['$scope', '$http','$uibModal', 'notificationFactory', 'AuthService', '$cookies',
    function($scope, $http, $uibModal, notificationFactory, AuthService, $cookies) {

                $http({
                    method: 'GET',
                    url: '/checksheets'

                }).success(function(data, status, headers, config) {
                    // this callback will be called asynchronously
                    // when the response is available
                    $scope.checksheets = data;

                })
                .error(function(data, status, headers, config) {
                notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
                });

                $scope.currentPage = 1;
                $scope.pageSize = AuthService.getPaginationSize();
                   $scope.modifyChecksheet = function(chksID) {
                var modalInstance = $uibModal.open({
                templateUrl: 'partials/checksheetModal.html',
                controller: 'checksheetModalController',
                scope: $scope,
                resolve: {
                    chksID: function() {
                        return chksID;
                    }
                }
            });


        };




    }
]);





//Controller designed to handle mixing of one or more checksheet block for the creation of a checksheet
angular.module('smApp').controller('setadvisingcontroller', ['$scope', '$http','$location', 'notificationFactory', 'AuthService', '$cookies',
    function($scope, $http, $location, notificationFactory, AuthService, $cookies) {

    //Global appointment length constant
     $scope.appointmentLength = 15;

     $scope.appointmentTimes = {
        S : new Array(24*60/($scope.appointmentLength)),
        M :new Array(24*60/($scope.appointmentLength)),
        T : new Array(24*60/($scope.appointmentLength)),
        W : new Array(24*60/($scope.appointmentLength)),
        TH : new Array(24*60/($scope.appointmentLength)),
        F : new Array(24*60/($scope.appointmentLength)),
        SA : new Array(24*60/($scope.appointmentLength))
     };


    $scope.newTimes = {
        S : new Array(),
        M :new Array(),
        T : new Array(),
        W : new Array(),
        TH : new Array(),
        F : new Array(),
        SA : new Array()
     };

     $scope.totalTime = {};
      $scope.newTimes.maxAppts = 0;

     $scope.timeMinAMPM = "PM";
     $scope.timeMaxAMPM = "PM";
  
     $scope.timediff = 0;
     // $scope.appointmentTimes.length='15';
     // $scope.timeMinMin = '00';
     $scope.setMinAMPM = function(time){
       $scope.timeMinAMPM = time;        
     }
     $scope.setMaxAMPM = function(time){
       $scope.timeMaxAMPM = time;        
     }
     
     $scope.hourtoIndex = function(hour,minutes){
        // console.log("hour:"+hour);
        // console.log("hour:"+minutes);
        return (((hour-1)*4) + (minutes/15));
     }

     $scope.indexTohour = function(index){
        return [((Math.floor(index/4))+1),((index%4)*15)];
     }

     $scope.addAppt = function()
     {

      


        $scope.oneSlot = {};
         $scope.arraySlot = {};
         $scope.arraySlot.state = 'true'; 
        if($scope.timeMinAMPM=="PM"){
            $scope.oneSlot.minHR = parseInt($scope.timeMinHr) + 12;
        } else {
            $scope.oneSlot.minHR = parseInt($scope.timeMinHr);
        }
        if($scope.timeMaxAMPM=="PM"){
            $scope.oneSlot.maxHR = parseInt($scope.timeMaxHr) + 12;

        } else {
             $scope.oneSlot.maxHR = parseInt($scope.timeMaxHr);
    
        }


        if ($scope.oneSlot.maxHR >= $scope.oneSlot.minHR){
        $scope.oneSlot.timediff =  $scope.oneSlot.maxHR - $scope.oneSlot.minHR;

        }
        else
         {
        $scope.oneSlot.timediff = 24- ($scope.oneSlot.minHR - $scope.oneSlot.maxHR) ;
         }
         if ($scope.timeMinMin=='30'){ 
             if ($scope.oneSlot.maxHR == $scope.oneSlot.minHR) {  $scope.oneSlot.timediff = '24'; }
            $scope.oneSlot.timediff = $scope.oneSlot.timediff - 0.5 }
        if ($scope.timeMaxMin=='30'){ 
              if ($scope.oneSlot.maxHR == $scope.oneSlot.minHR) {  

                // $scope.timediff = '0.5';
                 }
            $scope.oneSlot.timediff = $scope.oneSlot.timediff + 0.5 }

            $scope.oneSlot.maxMin = parseInt($scope.timeMaxMin);
            $scope.oneSlot.minMin = parseInt($scope.timeMinMin);
        


 
            

           if ($scope.oneSlot.timediff >= 24 )
           {
            notificationFactory.error("You can't have more than 10 hours of appointment session at once!");
            console.log($scope.oneSlot.maxHR);
             console.log($scope.oneSlot.minHR);
           }
           else if ($scope.oneSlot.timediff == 0 ){
            notificationFactory.error("Minimum appointment time slot to be opened is 30 min. Try again.");
           }
           else
           {
            notificationFactory.success("Appointment schedule modified! Submit when ready.");
            $scope.newTimes[$scope.timeDay].push($scope.timeMinHr+" : "+ $scope.timeMinMin +""+$scope.timeMinAMPM+" to "+$scope.timeMaxHr+" : "+ $scope.timeMaxMin+""+ $scope.timeMaxAMPM);
            if (($scope.hourtoIndex($scope.oneSlot.minHR,$scope.oneSlot.minMin)) > ($scope.hourtoIndex($scope.oneSlot.maxHR,$scope.oneSlot.maxMin)))
            {
                console.log("opposite");
                for (i = ($scope.hourtoIndex($scope.oneSlot.minHR,$scope.oneSlot.minMin));
                 i < $scope.appointmentTimes[$scope.timeDay].length; i++) 
                    {
                    console.log('This is i :'+i);
                    $scope.appointmentTimes[$scope.timeDay][i] = $scope.arraySlot;
                    }

                for (i = 0; i < ($scope.hourtoIndex($scope.oneSlot.maxHR,$scope.oneSlot.maxMin)); i++) 
                    {
                    console.log('This is i :'+i);
                    $scope.appointmentTimes[$scope.timeDay][i] = $scope.arraySlot;
                    }
            
            }
               else{
               console.log('this is i start:'+($scope.hourtoIndex($scope.oneSlot.minHR,$scope.oneSlot.minMin)));
                    console.log('while i is less than:'+($scope.hourtoIndex($scope.oneSlot.maxHR,$scope.oneSlot.maxMin)));
                    for (i = ($scope.hourtoIndex($scope.oneSlot.minHR,$scope.oneSlot.minMin)); i < ($scope.hourtoIndex($scope.oneSlot.maxHR,$scope.oneSlot.maxMin)) ; i++)
                    {
                    console.log('This is i :'+i);
                    $scope.appointmentTimes[$scope.timeDay][i] = $scope.arraySlot;
                    }
               }
               $scope.totalTime[$scope.timeDay] = 0;
                    angular.forEach($scope.appointmentTimes[$scope.timeDay],function(value,index){
                if(value.state) { 
                    $scope.totalTime[$scope.timeDay] = $scope.totalTime[$scope.timeDay] + 1;
                 }
         
            });


            $scope.newTimes.maxAppts = 0;

            console.log(JSON.stringify($scope.totalTime));

           for (var key in $scope.totalTime) {
                if ($scope.totalTime.hasOwnProperty(key)) {
                 $scope.newTimes.maxAppts = $scope.newTimes.maxAppts+  $scope.totalTime[key];
                     }
                }
             
            }

          $scope.dayAdded =  $scope.timeDay;


     }

     $scope.submitAppointments =  function(){

           $http({
                    method: 'POST',
                    url: '/appointmenttimes',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        appointmentTimes: $scope.appointmentTimes,
                        _id: AuthService.getuserid()
                    }

                }).success(function(data, status, headers, config) {
                 //Template will be set to show new advisors once addadvisor has been completed
                $scope.settemplateURL('partials/viewadvising.html');
               notificationFactory.info("Successfully added appointment times! ");
                })
                .error(function(data, status, headers, config) {
                    notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")

                });
        console.log(AuthService.getuserid());
     }


  }
]);


//Controller designed to handle mixing of one or more checksheet block for the creation of a checksheet
angular.module('smApp').controller('addnewstudentController', ['$scope', '$http','$location', 'notificationFactory', 'AuthService', '$cookies',
    function($scope, $http, $location, notificationFactory, AuthService, $cookies) {


//Method to modify templateURL 
               $http({
                        method: 'GET',
                        url: '/checksheetsinfo'

                    }).success(function(data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                        $scope.checksheets = data;
                        $scope.studentchecksheet = $scope.checksheets[0];
                        $scope.student.department = $scope.dpts[1].name;
                        //console.log(JSON.stringify($scope.courses | suffix:135));

                    })
                    .error(function(data, status, headers, config) {
                        notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
                    });


 $scope.generatepwd = function() {

            return AuthService.generatePassword();
        }




$scope.addnewStudent = function(){
   
   if(!$scope.studentchecksheet){
     notificationFactory.error("Error: Choose a valid checksheet prototype");
    return;
   }
   else{
    $scope.student.checksheetprotoid = [];
    $scope.student.advisor = [];
    $scope.student.advisor[0]= AuthService.getuserid();
    $scope.student.checksheetprotoid[0]  = $scope.studentchecksheet._id;
    console.log(JSON.stringify($scope.studentchecksheet._id));
         $http({
                    method: 'POST',
                    url: '/getchecksheetjson',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        checksheetid: $scope.studentchecksheet._id
                    }

                }).success(function(data, status, headers, config) {
                //Set template to revert back to displaying department so that user can view/update newly added department
                $scope.chksdata = data;

                for(i=0;i<$scope.chksdata.length;i++){
                   $scope.chksdata[i] = new Array($scope.chksdata[i]);
                  for(j=0;j<$scope.chksdata[i].length;j++){
                   $scope.chksdata[i][j] = {};
                  }
                }

                console.log('x'+JSON.stringify($scope.chksdata));
                $scope.student.checksheetdata = [];
                $scope.student.checksheetdata[0] = $scope.chksdata;
                       $http({
                    method: 'POST',
                    url: '/newstudents',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        arraytoAdd: $scope.student
                    }

                }).success(function(data, status, headers, config) {
                //Set template to revert back to displaying department so that user can view/update newly added department
                $scope.settemplateURL('partials/viewstudents.html');
                notificationFactory.info("Successfully added students: ");

                })
                .error(function(data, status, headers, config) {
                    console.log(" Not Doneee " + status + data + headers + config);
                    notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")

                });

                })
                .error(function(data, status, headers, config) {
                    console.log(" Not Doneee " + status + data + headers + config);
                    notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")

                });





   }
}


}

]);

//Controller designed to handle mixing of one or more checksheet block for the creation of a checksheet
angular.module('smApp').controller('advisorsetannouncement', ['$scope', '$http','$location', 'notificationFactory', 'AuthService',
    function($scope, $http, $location, notificationFactory, AuthService) {


   $http({
                  method: 'POST',
                  url: '/advisorannouncement',
                  data: {
                        _id: AuthService.getuserid()
                    }
                    }).success(function(data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                        $scope.advisorannouncementdata = data.announcement;
                    })
                    .error(function(data, status, headers, config) {
                        notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
                    });


$scope.updateannouncement = function(){


    $http({
                    method: 'POST',
                    url: '/updateadvisorannouncement',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        announcement: $scope.advisorannouncementdata,
                        _id: AuthService.getuserid()
                    }

                }).success(function(data, status, headers, config) {
                //Set template to revert back to displaying department so that user can view/update newly added department
                $scope.settemplateURL('partials/viewstudents.html');
                notificationFactory.info("Updated advisor's announcement message. ");
                })
                .error(function(data, status, headers, config) {
                notificationFactory.error("Error: Unable to update announcement. Try again.");
                });


}


}

]);


//Controller designed to handle mixing of one or more checksheet block for the creation of a checksheet
angular.module('smApp').controller('addexistingstudentController', ['$scope', '$http','$location', 'notificationFactory', 'AuthService', '$cookies',
    function($scope, $http, $location, notificationFactory, AuthService, $cookies) {



               $http({
                        method: 'GET',
                        url: '/checksheetsinfo'

                    }).success(function(data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                        $scope.checksheets = data;
                        $scope.checksheetid = $scope.checksheets[0];
                        $scope.chksdepartment = $scope.dpts[1].name;
             
                    })
                    .error(function(data, status, headers, config) {
                        notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
                    });



        $scope.divshow = true;

        $scope.updatestudent = function(){
              $scope.update = {}
            $scope.update._id = $scope.studentdetails._id;
            $scope.update.checksheetprotoid = $scope.checksheetid._id;
            $scope.update.advisor = AuthService.getuserid();
            console.log(JSON.stringify($scope.update));


               $http({
                    method: 'POST',
                    url: '/getchecksheetjson',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        checksheetid: $scope.checksheetid._id
                    }

                }).success(function(data, status, headers, config) {
                //Set template to revert back to displaying department so that user can view/update newly added department
                $scope.chksdata = data;

                for(i=0;i<$scope.chksdata.length;i++){
                   $scope.chksdata[i] = new Array($scope.chksdata[i]);
                  for(j=0;j<$scope.chksdata[i].length;j++){
                   $scope.chksdata[i][j] = {};
                  }
                }

                console.log('x'+JSON.stringify($scope.chksdata));
                $scope.update.checksheetdata = $scope.chksdata;
                          $http({
                    method: 'PUT',
                    url: '/updatecurrentstudent',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        update: $scope.update
                    }

                }).success(function(data, status, headers, config) {
                 //Template will be set to show new advisors once addadvisor has been completed
                // $scope.settemplateURL('partials/radvisor.html');
               notificationFactory.info("Successfully added new checksheet to student! ");
                })
                .error(function(data, status, headers, config) {
                notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")

                });

                })
                .error(function(data, status, headers, config) {
                    console.log(" Not Doneee " + status + data + headers + config);
                    notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")

                });

           


        };

        $scope.searchexistingstudent = function(){
            $scope.isCollapsed = false;

       

              $http({
                    method: 'POST',
                    url: '/findstudentbyid',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        studentid: $scope.studentid
                    }

                }).success(function(data, status, headers, config) {
                    console.log(JSON.stringify(data));
                $scope.studentdetails = data.student;
                $scope.studentadvisor = data.advisor;

            

                $scope.studentchecksheet = data.checksheet;
                $scope.divshow = false;
              
                //Set template to revert back to displaying department so that user can view/update newly added department
                // $scope.settemplateURL('partials/viewstudents.html');
                notificationFactory.info("Found a student. Verify before linking to a checksheet. ");

                })
                .error(function(data, status, headers, config) {
                notificationFactory.error("Error: Unable to find a student with: '"+$scope.studentid+ "' id. Try again.");
                });



        }

}

]);

//Controller designed to handle mixing of one or more checksheet block for the creation of a checksheet
angular.module('smApp').controller('advisorchecksheetController', ['$scope', '$http','$location', 'notificationFactory', 'AuthService', '$cookies',
    function($scope, $http, $location, notificationFactory, AuthService, $cookies) {

             //Method to modify templateURL 
               $http({
                        method: 'GET',
                        url: '/blockdetails'

                    }).success(function(data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                        $scope.blockdetails = data;

                        //console.log(JSON.stringify($scope.courses | suffix:135));

                    })
                    .error(function(data, status, headers, config) {
                        notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.");
                    });

        //Initialize checksheet json type and arrays to hold checksheet information
        $scope.checksheet = {};
        $scope.checksheet.blockid = [];
        $scope.tempblockid = [];
        //Default checksheet attributes
        $scope.checksheet.creator = $scope.username + " " + $scope.lastname;
        $scope.checksheet.credits = 0;
        $scope.checksheet.creatorID = AuthService.getuserid();      
        $scope.divshow = true;

        //Watch for changes in bloc description
        $scope.$watch('blockdesc', function(val) {
        if($scope.blockdetails){
        for(var i=0; i < $scope.blockdetails.length; i++)
            {
                if ($scope.blockdetails[i]._id == val){
                    $scope.blockdetail = $scope.blockdetails[i];
                    break;
                }
            }
        }
        });

        //Add block to checksheet database
        $scope.addtochecksheet = function(val){
        // Loop through checksheet to unsure block has not been repeated twice
          for(var i=0; i < $scope.checksheet.blockid.length; i++)
          {
            if (val._id === $scope.checksheet.blockid[i]){
            notificationFactory.error("Error: You cannot add same block on a checksheet twice!");
            return;
            }
          }
           $scope.checksheet.blockid.push(val._id);
           $scope.checksheet.credits = $scope.checksheet.credits + val.credits;
           $scope.tempblockid.push(val);
           $scope.blockdesc='None';
        }

        //Remove block from checksheet
       $scope.removeblock = function(idx){
        $scope.checksheet.credits = $scope.checksheet.credits - $scope.tempblockid[idx].credits;
        $scope.checksheet.blockid.splice(idx,1);
        $scope.tempblockid.splice(idx,1);
       }

       //Submit checksheet to the checksheet database
       $scope.submitChecksheet = function(){
            $http({
                    method: 'POST',
                    url: '/checksheets',
                    // set the headers so angular passing info as form data (not request payload)
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        arraytoAdd: $scope.checksheet
                    }

                }).success(function(data, status, headers, config) {
                 //Template will be set to show new advisors once addadvisor has been completed
                $scope.settemplateURL('partials/radvisor.html');
               notificationFactory.info("Successfully added checksheet to database! ");
                })
                .error(function(data, status, headers, config) {
                notificationFactory.error("Error: Status Code " + status + ". Contact admin if issue persists.")

                });
       }

        $scope.buildChecksheet = function (){
        $scope.divshow = false;
        };
    }
]);
