var express = require('express');
var queries = require('../SqlHelper/Queries')
var moment = require('moment');
var router = express.Router();
module.exports = router;
var DButilsAzure = require('../SqlHelper/DbUtils');
var jwt = require('jsonwebtoken');

router.use('/', function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, 'secret', function (err, decoded) {
            if (err) {
                return res.status(404).json({ success: false, message: 'Failed to authenticate token' });
            } else {
                var decoded = jwt.decode(token, { complete: true });
                req.decoded = decoded;
                next();
            }
        })
    }
    else {
        return res.status(404).json({ success: false, message: 'Failed to authenticate token' });
    }
});

router.get('/validation',function(req,res,next){
    var username = req.decoded.payload.username;
    res.json({
        success: true,
        message: 'token is valid',
        username: username
    });
})

router.post('/addSavedPoint', function (req, res) {
    try {
        var username = req.decoded.payload.username;
        var pointID = req.body.pointID;
        var date = moment().format('YYYY-MM-DD HH:mm:ss');
        var query = queries.getSavedPointInsertQuery(username, pointID, date, 0);

        //check that all paramters was given
        if (!username || !pointID) {
            res.status(500).send('missing paramters');
            return;
        }

        //enter user saved point into DB
        DButilsAzure.execQuery(query)
            .then(function (result) {
                res.send(result);
            })
            .catch(function (err) {
                res.status(500).send('Error Saving POI');
            })
    } catch{
        res.status(500).send("Oops... There was an error");
    }
})

router.get('/getSavedPoints', function (req, res) {
    var username = req.decoded.payload.username;
    var numOfPoints = req.query.numOfPoints;
    var query = queries.getSavedPointQuery(username, numOfPoints);

    //check that all paramters was given
    if (!username || !numOfPoints) {
        res.status(500).send('missing paramters');
        return;
    }

    //get user saved point into DB
    DButilsAzure.execQuery(query)
        .then(function (result) {
            var savedPoints = [];
            for (var i = 0; i < result.length; i++) {
                savedPoints.push(result[i]);
            }
            res.json({
                success: true,
                message: 'Saved points was granted',
                POI: savedPoints
            });
        })
        .catch(function (err) {
            res.status(500).send('Error In Saved POI retrival');
        })
})

router.delete('/removeSavedPoint', function (req, res) {
    try {
        var username = req.decoded.payload.username;
        var pointID = req.body.pointID;

        //check that all paramters was given
        if (!username || !pointID) {
            res.status(500).send('missing paramters');
            return;
        }

        //Delete user saved point
        var query = queries.getSavedPointDeleteQuery(username, pointID);
        DButilsAzure.execQuery(query)
            .then(function (result) {
                res.send(result);
            })
            .catch(function (err) {
                res.status(500).send('Error Deleting POI');
            })
    } catch{
        res.status(500).send("Oops... There was an error");
    }
})

router.patch('/saveFavoriteOrder', function (req, res) {
    try {
        var username = req.decoded.payload.username;
        var order = req.body.order;

        //check that all paramters was given
        if (!username || !order) {
            res.status(500).send('missing paramters');
            return;
        }

        //update user saved point order
        var query = queries.getSavedPointUpdateQuery(username, order);
        DButilsAzure.execQuery(query)
            .then(function (result) {
                res.send(result);
            })
            .catch(function (err) {
                res.status(500).send('Error saving POI order');
            })
    } catch{
        res.status(500).send("Oops... There was an error");
    }
})

router.get('/getPopularPoints', function (req, res) {
    try {
        var username = req.decoded.payload.username;
        var numOfPoints = req.query.numOfPoints;

        //check that all paramters was given
        if (!username || !numOfPoints) {
            res.status(500).send('missing paramters');
            return;
        }

        var userQuery = queries.getUserCategoryQuery(username);
        DButilsAzure.execQuery(userQuery)
            .then(function (result) {
                var categories = "("
                for (var i = 0; i < result.length; i++) {
                    categories += "'" + result[i]['category'] + "',";
                }
                categories = categories.substring(0, categories.lastIndexOf(",")) + ")"
                var query = queries.getPointsByCategoryQuery(categories, numOfPoints);
                DButilsAzure.execQuery(query)
                    .then(function (result) {
                        var points = [];
                        for (var i = 0; i < result.length; i++) {
                            points.push(result[i]);
                        }
                        res.json({
                            success: true,
                            message: 'Points was granted',
                            POI: points
                        });
                    })
                    .catch(function (err) {
                        res.status(500).send('Error POI retrival');
                    })
            })
            .catch(function (err) {
                res.status(500).send('Error categories retrival');
            })
    } catch{
        res.status(500).send("Oops... There was an error");
    }
})

router.post('/rankPoint', function (req, res) {
    try {
        var pointID = req.body.pointID;
        var rank = req.body.rank;
        var comment = req.body.comment;
        var username = req.decoded.payload.username;
        var isExists = false;
        var date = moment().format('YYYY-MM-DD HH:mm:ss');
        
        //check that all paramters was given
        if (!pointID || !rank) {
            res.status(500).send('missing paramters');
            return;
        }

        query = queries.getUserRankPointQuery(pointID, username);
        DButilsAzure.execQuery(query)
            .then(function (result) {
                if (result.length > 0) {
                    isExists = true;
                }

                if (isExists) {
                    if (!comment) {
                        comment = result[0]['review'];
                    }
                    insertRankQuery = queries.getUserRankPointUpdateQuery(pointID, username, date, rank, comment)
                }
                else {
                    if (!comment) {
                        comment = null;
                    }
                    insertRankQuery = queries.getUserRankPointInsertQuery(pointID, username, date, rank, comment)
                }

                DButilsAzure.execQuery(insertRankQuery)
                    .then(function (result) {
                        res.send(result);
                    })
                    .catch(function (err) {
                        res.status(500).send('Error Insert rank');
                    })
            })
            .catch(function (err) {
                res.status(500).send('Error reterive user rank');
            })
    } catch{
        res.status(500).send("Oops... There was an error");
    }
})