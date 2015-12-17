var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/ksm');

var db = mongoose.connection;

//Root User Schema
var rootSchema = mongoose.Schema({
    username: String,
    password: String
},{ collection : 'root' });
var rootCol = mongoose.model('root', rootSchema);


//Advisor User Schema
var advisorSchema = mongoose.Schema({
    username: String,
    password: String,
    email: String,
    id: String,
    firstname: String,
    lastname: String,
    type: String,
    department: String,
    office: String,
    phone: String,
    advisee: [String]
},{ collection : 'advisor' });
var advisorCol = mongoose.model('advisor', advisorSchema);


//Student User Schema
var studentSchema = mongoose.Schema({
    username: String,
    password: String,
    email: String,
    id: String,
    firstname: String,
    lastname: String,
    major: String,
    checksheetprotoid: String,
    classstatus: [String]
},{ collection : 'student' });
var studentCol = mongoose.model('student', studentSchema);

module.exports = {
    root: rootCol,
    advisor: advisorCol,
    student: studentCol,
};
