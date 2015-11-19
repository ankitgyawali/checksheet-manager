var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    User = require('../models/user.js');
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



router.post('/login', function(req, res, next) {
  console.log('asas');
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return res.status(500).json({err: err});
    }
    if (!user) {
      return res.status(401).json({err: info});
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({err: 'Could not log in user'});
      }
      res.status(200).json({status: 'Login successful!'});
    });
  })(req, res, next);
});

router.get('/logout', function(req, res) {
  req.logout();

  res.status(200).json({status: 'Bye!'});
});



router.post('/root', function(req, res ) {
   console.log('Inside post /root ');
  console.log('req body: '+req.body);
  console.log('req body usr: '+req.body.username);
  console.log('req body type: '+req.body.type);
  console.log('req body pwd: '+req.body.password);

  rootCol.findOne({ 'password': 'password' }, function (err, person) {
  if (err) return handleError(err);
  
  console.log('from mongo person object >   ' + person);
  console.log('Person object id>   ' + person._id);
})

 res.send({msg:'HI'});

});





module.exports = router;
