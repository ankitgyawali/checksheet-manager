// Designed by: Ankit Gyawali
// Email: agyaw792@gmail.com
// Description: Contains API services for syllabus manager app.
// Helps with different CRUD operation on the database collection.
var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    User = require('../models/user.js'),
    expressSession = require('express-session'),
    async = require('async');
var models = require('../database.js');


//Destroys session variables held on the server side during the app cycle.
router.get('/logout', function(req, res) {
    req.session.destroy();
});


//Searches the collection of appropriate type. Matches user name and password
//Extracs required data, stores them in session value and sends back appropriate response.
router.post('/login', function(req, res) {
    models[req.body.type].findOne({
        'username': req.body.username,
        'password': req.body.password
    }, function(err, person) {
        if (err) {
            res.send({
                username: '404',
                usertype: '404'
            });
        }
        if (person) {
            req.session.id = person._id;
            req.session.username = person.username;
            req.session.usertype = req.body.type;

            res.send({
                person: person,
                usertype: req.body.type
            });
        } else {
            res.status(404);
            res.send({
                username: 'nope',
                usertype: 'nope'
            })
        }
    })

});

//Returns students information as a whole including checksheet, advisor information
router.post('/searchstudentforroot', function(req, res) {

    models.student.findOne({
            'id': req.body.studentid
        }, '-password', function(err, student) {
            if (err) {
                return res.sendStatus(500);
            } else {
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

//Gets detail of advisor from the given id and returns populated result
//Student and their appropriate checksheet(& block id) are populated in the returned results.
router.post('/advisorstudentdetails', function(req, res) {

    models.advisor.findOne({
            '_id': req.body._id
        }, '-password', function(err, advisor) {
            if (err) {
                return res.sendStatus(500);
            } else {

                res.send(advisor)
            }
        }).populate({
            path: 'advisee',
            populate: {
                path: 'checksheetprotoid',
                populate: {
                    path: 'blockid',
                    model: 'block'
                },
                model: 'checksheet'
            }
        })
        .exec(function(err, docs) {});

});

//Searches student collection and sends minimal information excluding chcekchseet data and advisor.
//Used by appointment scheduler page for advisor.
router.post('/populatestudentids', function(req, res) {
    models.student.find({
        '_id': {
            $in: req.body.studentids
        }
    }, '-checksheetdata -checksheetprotoid -advisor', function(err, student) {
        if (err) {
            res.sendStatus(500);
        } else {
            console.log('ok' + student);
            res.send(student)
        }
    });

});

//Populate students with their advisor information and their checksheet information
router.post('/students', function(req, res) {
    var json = {};
    models.student.findOne({
        '_id': req.body.studentid
    }, function(err, student) {
        if (err) {
            res.sendStatus(500);
        } else {

            json.student = student;

            models.advisor.find({
                '_id': {
                    $in: json.student.advisor
                }
            }, '-password -advisee', function(err, advisor) {
                if (err) {
                    return res.sendStatus(500);
                } else {
                    json.advisor = advisor;
                    models.checksheet.find({
                        '_id': {
                            $in: json.student.checksheetprotoid
                        }
                    }, function(err, checksheet) {
                        if (err) {
                            return res.sendStatus(500);
                        } else {
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

//Gets minimal information for root users so that they can view their profile
router.post('/rootprofile', function(req, res) {
    models.root.findOne({
            _id: req.body._id
        }, '-password',
        function(err, doc) {
            if (err) {
                return res.sendStatus(500);
            }
            res.send(doc);
        });

});

//Gets minimal information for advisor so that they can view their profile
router.post('/advisorprofile', function(req, res) {
    models.advisor.findOne({
            _id: req.body._id
        }, '-password',
        function(err, doc) {
            if (err) {
                console.log("error because: " + err + "&&& doc: " + doc)
                return res.sendStatus(500);
            }
            res.send(doc);
        });

});

//Gets minimal information for student so that they can view their profile
router.post('/studentprofile', function(req, res) {

    models.student.findOne({
            _id: req.body._id
        }, '-password -checksheetdata -checksheetprotoid -registered -advisor',
        function(err, doc) {
            if (err) {
                return res.sendStatus(500);
            }
            res.send(doc);
        });

});

//Updates advisor's announcement after getting advisor from the supplied id
router.post('/advisorannouncement', function(req, res) {
    models.advisor.findOne({
            _id: req.body._id
        }, 'announcement',
        function(err, doc) {
            if (err) {
                console.log("error because: " + err + "&&& doc: " + doc)
                return res.sendStatus(500);
            }
            res.send(doc);
        });

});

//Returns everything from department controller
//Useful to have by root and advisors on their parent scope
router.get('/departments', function(req, res) {
    models.department.find({}, function(err, dpts) {
        res.send(dpts);
    });
});

//Returns minimal checksheet info from checksheet collection
router.get('/checksheetsinfo', function(req, res) {
    models.checksheet.find({}, '_id credits id department name type description', function(err, dpts) {
        res.send(dpts);
    });
});

//Returns everything from checksheet collection
router.get('/checksheets', function(req, res) {
    models.checksheet.find({}, function(err, chks) {
        res.send(chks);

    });
});

//Returns everything from blocks collection
router.get('/blocks', function(req, res) {
    models.block.find({}, function(err, chks) {
        res.send(chks);

    });
});

//Returns block details from block collections
router.get('/blockdetails', function(req, res) {
    models.block.find({}, '_id creator description slot department type name id credits', function(err, dpts) {
        res.send(dpts);

    });
});

//Gets names and ids from department collections
router.get('/departmentnames', function(req, res) {
    models.department.find({}, 'name id', function(err, dpts) {
        res.send(dpts);

    });
});

//Gets everything from root user collection besides their password
router.get('/roots', function(req, res) {
    models.root.find({}, '-password', function(err, dpts) {
        res.send(dpts);

    });
});

//Gets everything from advisor user collection besides their password
router.get('/advisors', function(req, res) {
    models.advisor.find({}, '-password', function(err, dpts) {
        res.send(dpts);

    });
});

//Finds students by their id and returns their information along with advisor information.
//Debug: Uses search(find()) instead of populate feature.
router.post('/findstudentbyid', function(req, res) {
    var json = {};
    models.student.findOne({
        'id': req.body.studentid
    }, '-password', function(err, student) {
        if (err) {
            console.log('something wrong');
            return res.sendStatus(500);
        }
        if (student) {

            json.student = student;
            console.log(json.student.advisor)
            models.advisor.find({
                '_id': {
                    $in: json.student.advisor
                }
            }, 'id department firstname lastname _id office phone email', function(err, docs) {
                if (err) {
                    return res.sendStatus(500);
                } else {
                    json.advisor = docs;
                    models.checksheet.find({
                        '_id': {
                            $in: json.student.checksheetprotoid
                        }
                    }, 'id credits name department description type', function(err, docs) {
                        if (err) {
                            return res.sendStatus(500);
                        } else {
                            json.checksheet = docs;
                            return res.json(json);
                        }
                    });
                }
            });
        } else {
            return res.sendStatus(500);
        }
    })
});



//Uses async.js library
//Returns class collection.
//Also returns department collection's name and id.
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

//Returns checksheet information and the data held inside block object.
router.post('/getchecksheetjson', function(req, res) {
    models.checksheet.findOne({
        '_id': req.body.checksheetid
    }, 'blockid', function(err, checksheet) {

        res.checksheetdata = new Array(checksheet.blockid.length);

        models.block.find({
            '_id': {
                $in: checksheet.blockid
            }
        }, 'slot').lean().exec(function(err, blocks) {
            for (var i = 0; i < checksheet.blockid.length; i++) {
                res.checksheetdata[i] = blocks[i].slot;
            }
            res.send(res.checksheetdata);
        });
    });
});



//Adds new student to the collection. Also updates advisor collection's appropriate object.
//Used by advisor when adding a new student.
router.post('/newstudents', function(req, res) {
    models.student.collection.insert(req.body.arraytoAdd, onInsert);

    function onInsert(err, docs) {
        if (err) {
            return res.sendStatus(500);
        } else {

            models.advisor.update({
                _id: req.body.arraytoAdd.advisor[0]
            }, {
                $push: {
                    'advisee': docs.ops[0]._id
                }
            }, {
                upsert: true
            }, function(err, data) {});
            return res.sendStatus(200);
        }
    }
});

//Finds a current student and adds them to advisor objects.
//Updates appropriate student's projects.
//Used by advisor when updating current students.
router.put('/updatecurrentstudent', function(req, res) {
    models.student.update({
            _id: req.body.update._id
        }, {
            $push: {
                'advisor': req.body.update.advisor,
                'checksheetprotoid': req.body.update.checksheetprotoid,
                'checksheetdata': req.body.update.checksheetdata
            }
        }, {
            upsert: true
        },
        function(err, data) {
            if (err) {
                console.log("1");
                return res.sendStatus(500);

            } else {
                models.advisor.update({
                    _id: req.body.update.advisor
                }, {
                    $addToSet: {
                        'advisee': req.body.update._id
                    }
                }, {
                    upsert: true
                }, function(err, data) {
                    if (err) {
                        console.log("2");
                        return res.sendStatus(500);
                    } else {
                        console.log("3");
                        return res.sendStatus(200);
                    }
                });
            }
        });
});

//Updates checksheet data of student. Finds students by id before updating their information.
//Used by student user group when they modify and submit their checksheet.
router.post('/checksheetdata', function(req, res) {

    var myIndex = {};

    myIndex['checksheetdata.' + req.body.checksheetinviewindex] = req.body.checksheetdata;

    models.student.update({
        _id: req.body._id
    }, {
        $set: myIndex
    }).exec(function(err, items) {

    });
    return res.sendStatus(200);
});

//Adds department to department collection
router.post('/departments', function(req, res) {
    models.department.collection.insert(req.body.arraytoAdd, onInsert);

    function onInsert(err, docs) {
        if (err) {
            return res.sendStatus(500);
        } else {

            return res.sendStatus(200)
        }
    }
});

//Adds blocks to block collection once they are created.
//Used by advisor group after creating a block
router.post('/blocks', function(req, res) {
    models.block.collection.insert(req.body.arraytoAdd, onInsert);
    function onInsert(err, docs) {
        if (err) {
            // TODO: handle error
            console.log("error because: " + err + "&&& doc: " + docs)
            return res.sendStatus(500);
        } else {

            return res.sendStatus(200)
        }
    }

});

//Inserts checksheet on checksheet collection
//Used by advisor to add checksheets.
router.post('/checksheets', function(req, res) {
    models.checksheet.collection.insert(req.body.arraytoAdd, onInsert);
    function onInsert(err, docs) {
        if (err) {
            return res.sendStatus(500);
        } else {
            return res.sendStatus(200)
        }
    }
});

//Inserts root users on root collection
//Used by root user when adding other root user.
router.post('/roots', function(req, res) {
    models.root.collection.insert(req.body.arraytoAdd, onInsert);
    function onInsert(err, docs) {
        if (err) {
            // TODO: handle error
            console.log("error because: " + err + "&&& doc: " + docs)
            return res.sendStatus(500);
        } else {
            console.info('%d potatoes were successfully stored.', docs.length);
            return res.sendStatus(200)
        }
    }

});

//Add advisors to advisor collections.
//Used by root users to add advisors.
router.post('/advisors', function(req, res) {
    models.advisor.collection.insert(req.body.arraytoAdd, onInsert);
    function onInsert(err, docs) {
        if (err) {
            // TODO: handle error
            console.log("error because: " + err + "&&& doc: " + docs)
            return res.sendStatus(500);
        } else {
            console.info('Advisors were successfully stored.', docs.length);
            return res.sendStatus(200)
        }
    }

});

//Add classes to class collection.
router.post('/classes', function(req, res) {
    models.class.collection.insert(req.body.arraytoAdd, onInsert);
    function onInsert(err, docs) {
        if (err) {
            return res.sendStatus(500);
        } else {
            return res.sendStatus(200)
        }
    }
});

//Finds advisor by their id and updates their annoucement property on advisor collection.
router.post('/updateadvisorannouncement', function(req, res) {
    models.advisor.update({
            _id: req.body._id
        }, {
            announcement: req.body.announcement
        }, {
            upsert: true
        },
        function(err, doc) {
            if (err) {
                return res.sendStatus(500);
            }
            return res.sendStatus(200);
        });
});

//Updates advisor appointment times
//Used by student to update advisor appointment times.
router.post('/requestappointment', function(req, res) {

    models.advisor.update({
            _id: req.body._id
        }, {
            appointmentTimes: req.body.appointmentTimes
        }, {
            upsert: true
        },
        function(err, doc) {
            if (err) {
                return res.sendStatus(500);
            }
            return res.sendStatus(200);
        });

});

//Updates advisor's appointment times.
router.post('/appointmenttimes', function(req, res) {
    models.advisor.update({
            _id: req.body._id
        }, {
            appointmentTimes: req.body.appointmentTimes
        }, {
            upsert: true
        },
        function(err, doc) {
            if (err) {
                return res.sendStatus(500);
            }
            return res.sendStatus(200);
        });
});

//Updates root settings for root users.
router.put('/rootsetting', function(req, res) {
    models.root.update({
            _id: req.body.setting._id
        }, req.body.setting, {
            upsert: true
        },
        function(err, doc) {
            if (err) {
                return res.sendStatus(500);
            }
            return res.sendStatus(200);
        });

});

//Updates advisor settings for advisors.
router.put('/advisorsetting', function(req, res) {
    console.log('new id req body: ' + req.body.setting._id);

    models.advisor.update({
            _id: req.body.setting._id
        }, req.body.setting, {
            upsert: true
        },
        function(err, doc) {
            if (err) {
                return res.sendStatus(500);
            }
            return res.sendStatus(200);
        });

});

//Updates student settings for students.
router.put('/studentsetting', function(req, res) {
    models.student.update({
            _id: req.body.setting._id
        }, req.body.setting, {
            upsert: true
        },
        function(err, doc) {
            if (err) {
                return res.sendStatus(500);
            }
            return res.sendStatus(200);
        });



});

//Update existing students after finding them from their id
//Used by advisor group
router.put('/existingstudent', function(req, res) {
    models.student.update({
            _id: req.body.newstudentID._id
        }, req.body.newstudentID, {
            upsert: true
        },
        function(err, doc) {
            if (err) {
                return res.sendStatus(500);
            }
            return res.sendStatus(200);
        });
});

//Update department information on department collection
//Used by advisor group
router.put('/departments', function(req, res) {
    console.log('new id req body: ' + req.body.newID._id);

    models.department.update({
            _id: req.body.newID._id
        }, req.body.newID, {
            upsert: true
        },
        function(err, doc) {
            if (err) {
                return res.sendStatus(500);
            }
            return res.sendStatus(200);
        });

});

//Update checksheet information.
//Used by advisor group
router.put('/checksheets', function(req, res) {
    console.log('new id req body: ' + req.body.newID._id);

    models.checksheet.update({
            _id: req.body.newID._id
        }, req.body.newID, {
            upsert: true
        },
        function(err, doc) {
            if (err) {
                console.log("error because: " + err + "&&& doc: " + doc)
                return res.sendStatus(500);
            } else {
                return res.sendStatus(200);
            }
        });


});

//Updates block information after finding the block with block id
//Used by advisor group
router.put('/blocks', function(req, res) {
    models.block.update({
            _id: req.body.newID._id
        }, req.body.newID, {
            upsert: true
        },
        function(err, doc) {
            if (err) {
                console.log("error because: " + err + "&&& doc: " + doc)
                return res.sendStatus(500);
            } else {
                return res.sendStatus(200);
            }
        });
});

//Update classes in class collection
//Used by root group
router.put('/classes', function(req, res) {
    models.class.update({
            _id: req.body.classID._id
        }, req.body.classID, {
            upsert: true
        },
        function(err, doc) {
            if (err) {
                return res.sendStatus(500);
            } else {
                return res.sendStatus(200);
            }
        });


});

//Delete student from the student collection. Searches student through their id
router.delete('/existingstudent', function(req, res) {
    models.student.remove({
        _id: req.body.deleteID
    }, function(err) {
        if (err) {
            console.log("error because: " + err + "&&& doc: " + doc)
            return res.sendStatus(500);
        }
        console.log("deleted: " + req.body.deleteID)
        return res.sendStatus(200);
    });
});

//Delete department from department collection.
router.delete('/departments', function(req, res) {
    models.department.remove({
        _id: req.body.deleteID
    }, function(err) {
        if (err) {
            return res.sendStatus(500);
        }
        return res.sendStatus(200);
    });

});

//Delete root user form root collection
router.delete('/roots', function(req, res) {
    models.root.remove({
        _id: req.body.deleteID
    }, function(err) {
        if (err) {
            console.log("error because: " + err + "&&& doc: " + doc)
            return res.sendStatus(500);
        }
        console.log("deleted: " + req.body.deleteID)
        return res.sendStatus(200);
    });

});

//Delete advisor from advisor collection
router.delete('/advisors', function(req, res) {
    models.advisor.remove({
        _id: req.body.deleteID
    }, function(err) {
        if (err) {
            return res.sendStatus(500);
        }
        return res.sendStatus(200);
    });
});

//Delete classes from class collection
router.delete('/classes', function(req, res) {
    models.class.remove({
        _id: req.body.deleteID
    }, function(err) {
        if (err) {
            return res.sendStatus(500);
        }
        return res.sendStatus(200);
    });

});

//Export routes
module.exports = router;