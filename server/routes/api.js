var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    User = require('../models/user.js'),
    expressSession = require('express-session');
    
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/ksm');

var db = mongoose.connection;

// rootCol.find({}, function(err, username) {
//     console.log(username);
//     console.log('>>>'+username[1]);
//   });




router.get('/logout', function(req, res) {
  req.logout();

  res.status(200).json({status: 'Bye!'});
});



router.post('/login', function(req, res ) {
   console.log('Inside post /root ');
  console.log('req body: '+req.body);
  console.log('req body usr: '+req.body.username);
  console.log('req body type: '+req.body.type);
  console.log('req body pwd: '+req.body.password);
  db.rootCol.findOne({ 'username':req.body.username,'password': req.body.password }, function (err, person) {
  if (err) {
     console.log('something wrong');
    res.send({username:'404',usertype:'root'});
   }
  if (person){
  //console.log('from mongo person object >   ' + person);
  //console.log('Person object id>   ' + person._id);
  req.session.id = person._id;
  req.session.username = person.username;
  req.session.usertype = 'root';

   res.send({username:person.username,usertype:'root',userid:person._id});
  }
  else
  {
    res.status(404);
    res.send({username:'nope',usertype:'nope'})
  }
})
  
});


router.get('/try', function(req, res ) {

    console.log('get try');
  console.log(req.session.pid);
  console.log(req.session.moo); 
});


module.exports = router;
