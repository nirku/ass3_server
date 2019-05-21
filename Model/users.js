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
    var questionQuery = queries.getUserQuestionInsertQuery(username, questions, answers);

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
                    DButilsAzure.execQuery(questionQuery)
                        .then(function (result) {
                            res.send(result);
                        })
                        .catch(function (err) {
                            res.status(500).send('Error Adding User');
                        })

                })
        })
        .catch(function (err) {
            res.status(500).send('Error Adding User');
        })
})

router.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var query = queries.getUserQuery(username)
    user = DButilsAzure.execQuery(query)
        .then(function (result) {
            var user = result[0];
            if (password == user['password']) {
                var payload = {
                    userName: user.username,
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
})

router.post('/passwordRetrival', function (req, res) {
    var username = req.body.username;
    var answers = req.body.answers;
    var queryQA = queries.getUserQuestionAnswerQuery(username)
    qa = DButilsAzure.execQuery(queryQA)
        .then(function (result) {
            var qa = result[0];
            if (answers[0] == qa['answer1'] && answers[1] == qa['answer2']) {
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

        })
        .catch(function (err) {
            res.status(500).send('Error In Password Retrival');
        })
})

router.post('/getUserQuestion', function (req, res) {
    var username = req.body.username;
    var queryQA = queries.getUserQuestionAnswerQuery(username)
    qa = DButilsAzure.execQuery(queryQA)
        .then(function (result) {
            var qa = result[0];;
            var questions = [qa['question1'],qa['question2']];
            res.json({
                success: true,
                message: 'Questions was granted',
                questions: questions
            });
        })
        .catch(function (err) {
            res.status(500).send('Error In Question Retrival');
        })
})