var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    User = require('../models/user.js');
var expressSession = require('express-session');

//    database = require('../database.js');


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/ksm');

var db = mongoose.connection;
var rootSchema = mongoose.Schema({
    username: String,
    password: String
},{ collection : 'root' });
var rootCol = mongoose.model('root', rootSchema);

// rootCol.find({}, function(err, username) {
//     console.log(username);
//     console.log('>>>'+username[1]);
//   });




router.post('/register', function(req, res) {
  User.register(new User({ username: req.body.username }), req.body.password, function(err, account) {
    if (err) {
      return res.status(500).json({err: err});
    }
    passport.authenticate('local')(req, res, function () {
      return res.status(200).json({status: 'Registration successful!'});
    });
  });
});





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
  
  rootCol.findOne({ 'username':req.body.username,'password': req.body.password }, function (err, person) {
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

   res.send({username:person.username,usertype:'root'});
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
