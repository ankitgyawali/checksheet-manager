var mongoose = require('mongoose');

// mongoose
mongoose.connect('mongodb://localhost/ksm');
var db = mongoose.connection;



module.exports = db;