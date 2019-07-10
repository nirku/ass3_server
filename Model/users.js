var express = require('express');
var queries = require('../SqlHelper/Queries')
var router = express.Router();
module.exports = router;
var DButilsAzure = require('../SqlHelper/DbUtils');
var jwt = require('jsonwebtoken');
var PriorityQueue = require('js-priority-queue');

var fs = require('fs'),
    xml2js = require('xml2js');
var parser = new xml2js.Parser();

router.post('/addUser', function (req, res) {
    try {
        var username = req.body.username;
        var password = req.body.password;
        var name = req.body.firstname;
        var lastName = req.body.lastname;
        var city = req.body.city;
        var country = req.body.country;
        var email = req.body.email;
        var query = queries.getUserInsertQuery(username, password, name, lastName, city, country, email);
        var categories = req.body.categories;
        var questions = req.body.questions;
        var answers = req.body.answers;

        //check that all paramters was given
        if (!username || !password || !name || !lastName || !city ||
            !country || !email || !categories || !questions || !answers) {
            res.status(500).send('missing paramters');
            return;
        }

        //check that paramters are not blank
        if (username.length == 0 || password.length == 0 || name.length == 0 ||
            lastName.length == 0 || city.length == 0 || country.length == 0 ||
            email.length == 0 || categories.length == 0 || questions.length == 0 || answers.length == 0) {
            res.status(500).send('empty paramters');
            return;
        }

        //check that email is valid
        if (!checkEmail(email)) {
            res.status(500).send('email is incorrect');
            return;
        }

        //check that username and password are valid by set of rules.
        if (!checkUsername(username) || !checkPassword(password)) {
            res.status(500).send('username or password is incorrect');
            return;
        }

        //check the country given
        if (checkCountry()) {
            res.status(500).send('country is incorrect');
            return;
        }

        //enter new user to users tables
        DButilsAzure.execQuery(query)
            .then(function (result) {
                var categoryArr = [];
                for (var i = 0; i < categories.length; i++) {
                    var categoryQuery = queries.getUserCategoryInsertQuery(username, categories, i);
                    categoryArr.push(DButilsAzure.execQuery(categoryQuery));
                }
                Promise.all(categoryArr)
                    .then(function (result) {
                        var questionArr = [];
                        for (var i = 0; i < questions.length; i++) {
                            var questionQuery = queries.getUserQuestionInsertQuery(username, questions, answers, i);
                            questionArr.push(DButilsAzure.execQuery(questionQuery))
                        }
                        Promise.all(questionArr)
                            .then(function (result) {
                                res.send(result);
                            })
                            .catch(function (err) {
                                res.status(500).send('Error Adding User');
                            })

                    })
                    .catch(function (err) {
                        res.status(500).send('Error Adding User');
                    })
            })
            .catch(function (err) {
                res.status(500).send('Error Adding User');
            })
    }
    catch{
        res.status(500).send("Oops... There was an error");
    }
})

router.get('/getUserInfo', function (req, res) {
    try {
        var username = req.query.username;
        //check that user name paramter was given
        if (!username) {
            res.status(500).send('missing paramter');
            return;
        }

        var query = queries.getUserQuery(username)
        DButilsAzure.execQuery(query)
            .then(function (result) {
                var user = result[0];
                res.json({
                    success: true,
                    message: 'User was granted',
                    user: user
                })
            })
            .catch(function (err) {
                res.status(500).send('Error in finding user');
            })
    } catch{
        res.status(500).send("Oops... There was an error");
    }
})

router.post('/login', function (req, res) {
    try {
        var username = req.body.username;
        var password = req.body.password;

        //check that all paramters was given
        if (!username || !password) {
            res.status(500).send('missing paramters');
            return;
        }

        var query = queries.getUserQuery(username)
        DButilsAzure.execQuery(query)
            .then(function (result) {
                var user = result[0];
                if (password == user['password']) {
                    var payload = {
                        username: user.username,
                    }
                    var token = jwt.sign(payload, 'secret', {
                        expiresIn: "1d" // expires in 24 hours
                    });
                    // return the information including token as JSON
                    res.json({
                        success: true,
                        message: 'Token was granted',
                        token: token
                    });
                }
                else {
                    res.status(404).send('Wrong Password');
                }

            })
            .catch(function (err) {
                res.status(500).send('Error In Logging');
            })
    } catch{
        res.status(500).send("Oops... There was an error");
    }
})

router.post('/passwordRetrival', function (req, res) {
    try {
        var username = req.body.username;
        var answers = req.body.answers;

        //check that all paramters was given
        if (!username || !answers) {
            res.status(500).send('missing paramters');
            return;
        }

        var queryQA = queries.getUserAnswerQuery(username)
        DButilsAzure.execQuery(queryQA)
            .then(function (result) {
                if (result.length > 0) {
                    var isCorrect = true;
                    for (var i = 0; i < result.length; i++) {
                        if (result[i]['answer'] != answers[i]) {
                            isCorrect = false;
                            break;
                        }
                    }
                    if (isCorrect) {
                        var query = queries.getUserQuery(username);
                        user = DButilsAzure.execQuery(query).then(function (result) {
                            var user = result[0];
                            var password = user['password'];
                            res.json({
                                success: true,
                                message: 'Password was granted',
                                password: password
                            });
                        })
                    }
                    else {
                        res.status(404).send('Wrong Answers');
                    }
                }
                else {
                    res.status(500).send('Error In Password Retrival');
                }
            })
            .catch(function (err) {
                res.status(500).send('Error In Password Retrival');
            })
    } catch{
        res.status(500).send("Oops... There was an error");
    }
})

router.get('/getUserQuestion', function (req, res) {
    try {
        var username = req.query.username;

        //check that all paramters was given
        if (!username) {
            res.status(500).send('missing paramters');
            return;
        }

        var queryQA = queries.getUserQuestionQuery(username)
        DButilsAzure.execQuery(queryQA)
            .then(function (result) {
                var questions = [];
                for (var i = 0; i < result.length; i++) {
                    questions.push(result[i]['question'])
                }
                res.json({
                    success: true,
                    message: 'Questions was granted',
                    questions: questions
                });
            })
            .catch(function (err) {
                res.status(500).send('Error In Question Retrival');
            })
    } catch{
        res.status(500).send("Oops... There was an error");
    }
})

router.get('/getAllQuestions', function (req, res) {
    try {
        query = queries.getAllQuestionQuery();
        DButilsAzure.execQuery(query)
            .then(function (result) {
                var questions = [];
                for (var i = 0; i < result.length; i++) {
                    questions.push(result[i])
                }
                res.json({
                    success: true,
                    message: 'Questions was granted',
                    questions: questions
                });
            })
            .catch(function (err) {
                res.status(500).send('Error In Question Retrival');
            })
    } catch{
        res.status(500).send("Oops... There was an error");
    }
})

router.get('/getAllCategories', function (req, res) {
    try {
        query = queries.getAllCategoriesQuery();
        DButilsAzure.execQuery(query)
            .then(function (result) {
                var categories = [];
                for (var i = 0; i < result.length; i++) {
                    categories.push(result[i]['category'])
                }
                res.json({
                    success: true,
                    message: 'Categories was granted',
                    categories: categories
                });
            })
            .catch(function (err) {
                res.status(500).send('Error In Categories Retrival');
            })
    } catch{
        res.status(500).send("Oops... There was an error");
    }
})

router.get('/getAllCountries', function (req, res) {
    try {
        fs.readFile('countries.xml', function (err, data) {
            parser.parseString(data, function (err, result) {
                res.send(result);
                console.log('Done');
            });
        });
    } catch{
        res.status(500).send("Oops... There was an error");
    }
})

function checkUsername(username) {
    if (username.length >= 3 && username.length <= 8) {
        if (/^[a-zA-Z]+$/.test(username)) {
            return true;
        }
    }
    return false;
}

function checkPassword(password) {
    if (password.length >= 5 && password.length <= 10) {
        if (/(?:\d+[a-zA-Z]|[a-zA-Z]+\d)[a-zA-Z\d]*/.test(password)) {
            return true;
        }
    }
    return false;
}

function checkEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function checkCountry(country) {
    try {
        var data = fs.readFileSync('countries.xml');
        parser.parseString(data, function (err, result) {
            var counties = result.Countries.Country;
            counties.forEach(elem => {
                if (elem.Name[0] == country) {
                    return true;
                }
            });
            return false;
        })
    }
    catch {
        return false;
    }
}