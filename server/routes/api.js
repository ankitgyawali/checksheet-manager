var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    User = require('../models/user.js'),
    expressSession = require('express-session');

var models = require('../database.js');

// rootCol.find({}, function(err, username) {
//     console.log(username);
//     console.log('>>>'+username[1]);
//   });




router.get('/logout', function(req, res) {

  req.session.destroy();

});



router.post('/login', function(req, res ) {
   console.log('Inside post /root ');
  console.log('req body: '+req.body);
  console.log('req body usr: '+req.body.username);
  console.log('req body type: '+req.body.type);
  console.log('req body pwd: '+req.body.password);

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

  console.log("Gotten department");

  models.department.find({}, function(err, dpts) {
    res.send(dpts); 
    console.log(dpts); 
  }); 
});

router.put('/departments', function(req, res) {
  console.log('new id req body: '+req.body.newID._id);

   // console.log('new id req body newid.name : '+req.newID.name);
  console.log("Gotten put request");

  models.department.findOneAndUpdate(req.body.newID._id, req.body.newID, {upsert:true}, 
    function(err, doc){
    if (err) return res.send(500, { error: err });
    return res.send("succesfully saved");
});



});

module.exports = router;
