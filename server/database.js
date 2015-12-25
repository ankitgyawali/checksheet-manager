var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/ksm');

var db = mongoose.connection;

//Root User Schema
var rootSchema = mongoose.Schema({
    username: String,
    password: String,
    email: { type: String, unique: true },
    firstname: String,
    lastname: String
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



//Department Schema
var deparmentSchema = mongoose.Schema({
    name: String,
    id: { type: String, unique: true },
    office: String,
    phone: String
},{ collection : 'department' });
var departmentCol = mongoose.model('department', deparmentSchema);


//Class Schema
var classSchema = mongoose.Schema({
    name: String,
    department: String,
    prefix: String,
    suffix: Number
},{ collection : 'class' });
classSchema.index({ prefix: 1, suffix: 1}, { unique: true });
var classCol = mongoose.model('class', classSchema);



module.exports = {
    root: rootCol,
    advisor: advisorCol,
    student: studentCol,
    department: departmentCol,
    class: classCol
};
