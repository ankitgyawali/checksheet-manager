var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    User = require('../models/user.js'),
    expressSession = require('express-session'),
    async = require('async');
var models = require('../database.js');

// rootCol.find({}, function(err, username) {
//     console.log(username);
//     console.log('>>>'+username[1]);
//   });




router.get('/logout', function(req, res) {

  req.session.destroy();

});



router.post('/login', function(req, res ) {

  console.log('req body usr: '+req.body.username);


  models[req.body.type].findOne({ 'username':req.body.username,'password': req.body.password }, function (err, person) {
  if (err) {
     console.log('something wrong');
    res.send({username:'404',usertype:'404'});
   }
  if (person){
  //console.log('from mongo person object >   ' + person);
  //console.log('Person object id>   ' + person._id);
  req.session.id = person._id;
  req.session.username = person.username;
  req.session.usertype = req.body.type;

   res.send({person:person,usertype:req.body.type});
  }
  else
  {
    res.status(404);
    res.send({username:'nope',usertype:'nope'})
  }
})
  
});


// router.post('/advisorstudentdetails', function(req, res ) {


//  models.advisor.findOne({'_id': req.body._id }).
//   .lean()
//   .populate({ path: 'advisee' })
//   .exec(function(err, docs) {

//     var options = {
//       path: 'advisee.checksheetprotoid',
//       model: 'checksheet'
//     };

//     if (err) return res.json(500);
//     models.advisor.populate(docs, options, function (err, projects) {
//       res.json(projects);
//     });
//   });

// });
 

// router.post('/populateappointmenttimes', function(req, res ) {

//      models.advisor.findOne({'_id': req.body._id },'-password' ,function(err, advisor){
//       if(err){
//         return res.sendStatus(500);
//       }
//       else{

//       res.send(advisor)
//       }
//       }).populate({ 
//      path: "appointmenttimes.S.studentid",
//      model: 'student'
//   })
//   .exec(function(err, docs) {});


// });


//Returns students information as a whole including checksheet, advisor information
router.post('/searchstudentforroot', function(req, res ) {

     models.student.findOne({'id': req.body.studentid },'-password' ,function(err, student){
      if(err){
        return res.sendStatus(500);
      }
      else{

      res.send(student)
      }
      }).populate({ 
     path: 'checksheetprotoid advisor',
     populate: {
       path: 'blockid',
       model: 'block'
     } 
  })
  .exec(function(err, docs) {});

});


router.post('/advisorstudentdetails', function(req, res ) {

     models.advisor.findOne({'_id': req.body._id },'-password' ,function(err, advisor){
      if(err){
        return res.sendStatus(500);
      }
      else{

      res.send(advisor)
      }
      }).populate({ 
     path: 'advisee',
     populate: {
       path: 'checksheetprotoid',
       populate: {
        path: 'blockid', model: 'block'
       },
       model: 'checksheet'
     } 
  })
  .exec(function(err, docs) {});

});

router.post('/populatestudentids', function(req, res ) {

     models.student.find({'_id': { $in: req.body.studentids }},'-checksheetdata -checksheetprotoid -advisor', function(err, student) {
       if(err)
    {
      res.sendStatus(500);
    }
    else
    {
      console.log('ok'+ student);
      res.send(student)
    }
     });

});


router.post('/students', function(req, res) {
  var json = {};
  models.student.findOne({'_id':req.body.studentid}, function(err, student) {
    if(err)
    {
      res.sendStatus(500);
    }
    else
    {

    json.student = student;
    
      models.advisor.find({'_id': { $in: json.student.advisor } }, '-password -advisee' ,function(err, advisor){
      if(err){
        return res.sendStatus(500);
      }
      else{
      json.advisor = advisor;



      models.checksheet.find({'_id': { $in: json.student.checksheetprotoid } },function(err, checksheet){
      if(err){
        return res.sendStatus(500);
      }
      else{
      json.checksheet = checksheet;
      return res.json(json)
      }
      }).populate('blockid').exec(function(err, items) {

      });


      }
      });

    }
   

  }); 
});






// router.post('/students', function(req, res) {
//   var json = {};
//   models.student.findOne({'_id':req.body.studentid}, function(err, student) {
//     if(err)
//     {
//       res.sendStatus(500);
//     }
//     else
//     {

//     json.student = student;
    
//       models.advisor.find({'_id': { $in: json.student.advisor } }, '-password -advisee' ,function(err, advisor){
//       if(err){
//         return res.sendStatus(500);
//       }
//       else{
//       json.advisor = advisor;


//       models.checksheet.find({'_id': { $in: json.student.checksheetprotoid } },function(err, checksheet){
//       if(err){
//         return res.sendStatus(500);
//       }
//       else{
//       json.checksheet = checksheet;

//       json.block = [];


//       for (var i = 0;i<json.checksheet.length;i++){

//       models.block.find({'_id': { $in: json.checksheet[i].blockid } },function(err, block){
//       if(err){
//         return res.sendStatus(500);
//       }
//       else{
//       console.log('ok:'+i);
//       json.block.push(block);
//       }
//       });


//       }

//       console.log('jsonblock= '+ json.block);
//       return res.json(json);


//       }
//       });


//       }
//       });

//     }
   

//   }); 
// });


router.post('/rootprofile', function(req, res) {

  models.root.findOne({_id:req.body._id}, '-password',
    function(err, doc){
    if (err) {
      return res.sendStatus(500);
    }
    res.send(doc);
});

});




router.post('/advisorprofile', function(req, res) {

  models.advisor.findOne({_id:req.body._id}, '-password',
    function(err, doc){
    if (err) {
     console.log("error because: "+ err + "&&& doc: "+doc)
      return res.sendStatus(500);
    }
    res.send(doc);
});

});


router.post('/studentprofile', function(req, res) {

  models.student.findOne({_id:req.body._id}, '-password -checksheetdata -checksheetprotoid -registered -advisor',
    function(err, doc){
    if (err) {
     console.log("error because: "+ err + "&&& doc: "+doc)
      return res.sendStatus(500);
    }
    res.send(doc);
});

});


router.post('/advisorannouncement', function(req, res) {

  models.advisor.findOne({_id:req.body._id}, 'announcement',
    function(err, doc){
    if (err) {
     console.log("error because: "+ err + "&&& doc: "+doc)
      return res.sendStatus(500);
    }
    res.send(doc);
});

});


router.get('/departments', function(req, res) {

  models.department.find({}, function(err, dpts) {
    res.send(dpts); 

  }); 
});

router.get('/checksheetsinfo', function(req, res) {

  models.checksheet.find({},'_id credits id department name type description', function(err, dpts) {
    res.send(dpts); 

  }); 
});




router.get('/departments', function(req, res) {

  models.department.find({}, function(err, dpts) {
    res.send(dpts); 

  }); 
});

router.get('/checksheets', function(req, res) {

  models.checksheet.find({}, function(err, chks) {
    res.send(chks); 

  }); 
});

router.get('/blocks', function(req, res) {

  models.block.find({}, function(err, chks) {
    res.send(chks); 

  }); 
});


router.get('/blockdetails', function(req, res) {

  models.block.find({}, '_id creator description slot department type name id credits', function(err, dpts) {
    res.send(dpts); 

  }); 
});


router.get('/departmentnames', function(req, res) {

  models.department.find({}, 'name id', function(err, dpts) {
    res.send(dpts); 

  }); 
});




router.get('/roots', function(req, res) {

  models.root.find({},'-password' ,function(err, dpts) {
    res.send(dpts); 

  }); 
});

router.get('/advisors', function(req, res) {

  models.advisor.find({},'-password' ,function(err, dpts) {
    res.send(dpts); 

  }); 
});


// router.get('/classes', function(req, res) {
//   var json = {}

//   models.department.find({}, 'name id', function(err, dpts) {
//     console.log(dpts); 
//    // res.write(dpts); 
//    json.dpts = dpts;
//    // return res;
//    models.class.find({}, function(err, courses) {
//    json.courses=courses; 
//    res.json(json);
//   });
//   }); 

// });

router.post('/findstudentbyid', function(req, res) {

var json = {};

models.student.findOne({'id':req.body.studentid},'-password', function (err, student) {
  if (err) {
     console.log('something wrong');
     return res.sendStatus(500);
   }
  if (student){

    json.student = student;
    console.log(json.student.advisor)
    models.advisor.find({'_id': { $in: json.student.advisor } }, 'id department firstname lastname _id office phone email' ,function(err, docs){
    if(err){
    return res.sendStatus(500);
    }
    else{
    json.advisor = docs;
      models.checksheet.find({'_id': { $in: json.student.checksheetprotoid } }, 'id credits name department description type' ,function(err, docs){
      if(err){
        return res.sendStatus(500);
      }
      else{
        json.checksheet = docs;
      return res.json(json);
      }
      });

  
    } 

    });

  }
  else
  {
   return res.sendStatus(500);
  }

})
  
});



//ASYNC GET
router.get('/classes', function(req, res) {
  var json = {};

async.parallel({
  courses: function(callback) {
    return models.class.find({}, function(err, result) {
      return callback(err, result);
    });
  },
  dpts: function(callback) {
    return models.department.find({}, 'name id', function(err, result) {
      return callback(err, result);
    });
  }
}, function(err, json) {
  return res.json(json);
});

});


router.post('/getchecksheetjson', function(req, res) {

console.log(req.body.checksheetid);
models.checksheet.findOne({ '_id':req.body.checksheetid },'blockid' , function (err, checksheet) {

res.checksheetdata = new Array(checksheet.blockid.length);


models.block.find({'_id': { $in: checksheet.blockid } },'slot').lean().exec(function(err, blocks) {
for (var i=0;i < checksheet.blockid.length;i++)
{
res.checksheetdata[i] = blocks[i].slot;
}


 res.send(res.checksheetdata);


});

});

});




router.post('/newstudents', function(req, res) {




models.student.collection.insert(req.body.arraytoAdd, onInsert);

function onInsert(err, docs) {
    if (err) {
        // TODO: handle error
         console.log("error because: "+ err + "&&& doc: "+docs)
      return res.sendStatus(500);
    } else {

  models.advisor.update({_id: req.body.arraytoAdd.advisor[0] },
         {$push: { 'advisee' : docs.ops[0]._id }},{upsert:true}, function(err, data) { 
          });
         return res.sendStatus(200);
    }
}


});


router.put('/updatecurrentstudent', function(req, res) {


console.log('New'+req.body.update.checksheetdata);


models.student.update({_id: req.body.update._id },
         {$push: { 'advisor' : req.body.update.advisor, 'checksheetprotoid':req.body.update.checksheetprotoid, 'checksheetdata':req.body.update.checksheetdata  }},{upsert:true}, 
         function(err, data) { 
          if (err){
             console.log("1");
          return res.sendStatus(500);

          }
          else{
            models.advisor.update({_id: req.body.update.advisor },
         {$addToSet: { 'advisee' : req.body.update._id }},{upsert:true}, function(err, data) { 
           if(err){
             console.log("2");
            return res.sendStatus(500);
           }
           else
           {
             console.log("3");
            return res.sendStatus(200);
           }
          });
          }
          });


  
});





router.post('/checksheetdata', function(req, res) {

var myIndex = {}; 

myIndex['checksheetdata.' + req.body.checksheetinviewindex] = req.body.checksheetdata;

 models.student.update({_id: req.body._id },
         {$set: myIndex}).exec(function(err, items) {

      });
          
          

console.log(req.body._id);
console.log(req.body.checksheetdata);
console.log(req.body.checksheetinviewindex);
     return res.sendStatus(200);
});





router.post('/departments', function(req, res) {

models.department.collection.insert(req.body.arraytoAdd, onInsert);

function onInsert(err, docs) {
    if (err) {
        // TODO: handle error
         console.log("error because: "+ err + "&&& doc: "+docs)
      return res.sendStatus(500);
    } else {
        console.info('%d potatoes were successfully stored.', docs.length);
         return res.sendStatus(200)
    }
}

});

router.post('/blocks', function(req, res) {

models.block.collection.insert(req.body.arraytoAdd, onInsert);

function onInsert(err, docs) {
    if (err) {
        // TODO: handle error
      console.log("error because: "+ err + "&&& doc: "+docs)
      return res.sendStatus(500);
    } else {

         return res.sendStatus(200)
    }
}

});

router.post('/checksheets', function(req, res) {

models.checksheet.collection.insert(req.body.arraytoAdd, onInsert);

function onInsert(err, docs) {
    if (err) {
        // TODO: handle error
      console.log("error because: "+ err + "&&& doc: "+docs)
      return res.sendStatus(500);
    } else {

         return res.sendStatus(200)
    }
}

});


router.post('/roots', function(req, res) {

models.root.collection.insert(req.body.arraytoAdd, onInsert);

function onInsert(err, docs) {
    if (err) {
        // TODO: handle error
         console.log("error because: "+ err + "&&& doc: "+docs)
      return res.sendStatus(500);
    } else {
        console.info('%d potatoes were successfully stored.', docs.length);
         return res.sendStatus(200)
    }
}

});

router.post('/advisors', function(req, res) {

models.advisor.collection.insert(req.body.arraytoAdd, onInsert);

function onInsert(err, docs) {
    if (err) {
        // TODO: handle error
         console.log("error because: "+ err + "&&& doc: "+docs)
      return res.sendStatus(500);
    } else {
        console.info('Advisors were successfully stored.', docs.length);
         return res.sendStatus(200)
    }
}

});



router.post('/classes', function(req, res) {

models.class.collection.insert(req.body.arraytoAdd, onInsert);

function onInsert(err, docs) {
    if (err) {
        // TODO: handle error
         console.log("error because: "+ err + "&&& doc: "+docs)
      return res.sendStatus(500);
    } else {
        console.info('Classes were successfully added to database.', docs.length);
         return res.sendStatus(200)
    }
}
   

});


router.post('/updateadvisorannouncement', function(req, res) {

  models.advisor.update({_id:req.body._id}, {announcement:req.body.announcement}, {upsert:true}, 
    function(err, doc){
    if (err) {

      return res.sendStatus(500);
    }
    return res.sendStatus(200);
});

});


router.post('/requestappointment', function(req, res) {

  models.advisor.update({_id:req.body._id}, {appointmentTimes:req.body.appointmentTimes}, {upsert:true}, 
    function(err, doc){
    if (err) {
     console.log("error because: "+ err + "&&& doc: "+doc)
      return res.sendStatus(500);
    }
    return res.sendStatus(200);
});

});

router.post('/appointmenttimes', function(req, res) {
  console.log('new id req body: '+req.body._id);
   console.log('new id req body: '+req.body.appointmentTimes);


  models.advisor.update({_id:req.body._id}, {appointmentTimes:req.body.appointmentTimes}, {upsert:true}, 
    function(err, doc){
    if (err) {
     console.log("error because: "+ err + "&&& doc: "+doc)
      return res.sendStatus(500);
    }
    return res.sendStatus(200);
});


  
});

router.put('/rootsetting', function(req, res) {
 

  models.root.update({_id:req.body.setting._id}, req.body.setting, {upsert:true}, 
    function(err, doc){
    if (err) {
     console.log("error because: "+ err + "&&& doc: "+doc)
      return res.sendStatus(500);
    }
    return res.sendStatus(200);
});

});



router.put('/advisorsetting', function(req, res) {
  console.log('new id req body: '+req.body.setting._id);

  models.advisor.update({_id:req.body.setting._id}, req.body.setting, {upsert:true}, 
    function(err, doc){
    if (err) {
     console.log("error because: "+ err + "&&& doc: "+doc)
      return res.sendStatus(500);
    }
    return res.sendStatus(200);
});

});


router.put('/studentsetting', function(req, res) {
  console.log('new id req body: '+req.body.setting._id);

  models.student.update({_id:req.body.setting._id}, req.body.setting, {upsert:true}, 
    function(err, doc){
    if (err) {
     console.log("error because: "+ err + "&&& doc: "+doc)
      return res.sendStatus(500);
    }
    return res.sendStatus(200);
});


  
});

router.put('/existingstudent', function(req, res) {
  console.log('new id req body: '+req.body.newstudentID._id);

  models.student.update({_id:req.body.newstudentID._id}, req.body.newstudentID, {upsert:true}, 
    function(err, doc){
    if (err) {
     console.log("error because: "+ err + "&&& doc: "+doc)
      return res.sendStatus(500);
    }
    return res.sendStatus(200);
});
  
});



router.put('/departments', function(req, res) {
  console.log('new id req body: '+req.body.newID._id);

  models.department.update({_id:req.body.newID._id}, req.body.newID, {upsert:true}, 
    function(err, doc){
    if (err) {
     console.log("error because: "+ err + "&&& doc: "+doc)
      return res.sendStatus(500);
    }
    return res.sendStatus(200);
});
  
});




router.put('/checksheets', function(req, res) {
  console.log('new id req body: '+req.body.newID._id);

  models.checksheet.update({_id:req.body.newID._id}, req.body.newID, {upsert:true}, 
    function(err, doc){
    if (err) {
     console.log("error because: "+ err + "&&& doc: "+doc)
      return res.sendStatus(500);
    }
    else {
    return res.sendStatus(200);
  }
});

  
});

router.put('/blocks', function(req, res) {
  console.log('new id req body: '+req.body.newID._id);

  models.block.update({_id:req.body.newID._id}, req.body.newID, {upsert:true}, 
    function(err, doc){
    if (err) {
     console.log("error because: "+ err + "&&& doc: "+doc)
      return res.sendStatus(500);
    }
    else {
    return res.sendStatus(200);
  }
});

  
});


router.put('/classes', function(req, res) {
  console.log('new id req body: '+req.body.classID._id);

  models.class.update({_id:req.body.classID._id}, req.body.classID, {upsert:true}, 
    function(err, doc){
    if (err) {
     console.log("error because: "+ err + "&&& doc: "+doc)
      return res.sendStatus(500);
    }
    else {
    return res.sendStatus(200);
  }
});

  
});

router.delete('/existingstudent', function(req, res) {


models.student.remove({ _id: req.body.deleteID }, function(err) {
    if (err) {
      console.log("error because: "+ err + "&&& doc: "+doc)
      return res.sendStatus(500);
    }
    console.log("deleted: "+ req.body.deleteID)
    return res.sendStatus(200);
});

});


router.delete('/departments', function(req, res) {

  console.log("deleting department");
  console.log (req);

models.department.remove({ _id: req.body.deleteID }, function(err) {
    if (err) {
      console.log("error because: "+ err + "&&& doc: "+doc)
      return res.sendStatus(500);
    }
    console.log("deleted: "+ req.body.deleteID)
    return res.sendStatus(200);
});

});

router.delete('/roots', function(req, res) {

  console.log("deleting root user");


models.root.remove({ _id: req.body.deleteID }, function(err) {
    if (err) {
      console.log("error because: "+ err + "&&& doc: "+doc)
      return res.sendStatus(500);
    }
    console.log("deleted: "+ req.body.deleteID)
    return res.sendStatus(200);
});

});


router.delete('/advisors', function(req, res) {

  console.log("deleting advisr");


models.advisor.remove({ _id: req.body.deleteID }, function(err) {
    if (err) {
      console.log("error because: "+ err + "&&& doc: "+doc)
      return res.sendStatus(500);
    }
    console.log("deleted: "+ req.body.deleteID)
    return res.sendStatus(200);
});

});



router.delete('/classes', function(req, res) {

  console.log("deleting classes");
  console.log (req);

models.class.remove({ _id: req.body.deleteID }, function(err) {
    if (err) {
      console.log("error because: "+ err + "&&& doc: "+doc)
      return res.sendStatus(500);
    }
    console.log("deleted: "+ req.body.deleteID)
    return res.sendStatus(200);
});

});


module.exports = router;
