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

   res.send({username:person.username,usertype:req.body.type,userid:person._id});
  }
  else
  {
    res.status(404);
    res.send({username:'nope',usertype:'nope'})
  }
})
  
});


router.get('/departments', function(req, res) {

  models.department.find({}, function(err, dpts) {
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

//ASYNC GET
router.get('/classes', function(req, res) {
  var json;
  json = {};

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


router.post('/departments', function(req, res) {

  // console.log('req body usr: '+JSON.stringify(req.body.arraytoAdd));
  // req.body.arraytoAdd.forEach( function (arrayItem)
  // {
  //   models.department.insert(arrayItem);
  //   console.log('sucessfully inserted: '+JSON.stringify(arrayItem));
  // });


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
