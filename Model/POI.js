var express = require('express');
var queries = require('../SqlHelper/Queries')
var moment = require('moment');
var router = express.Router();
module.exports = router;
var DButilsAzure = require('../SqlHelper/DbUtils');
var jwt = require('jsonwebtoken');


router.get('/getAllPoints', function (req, res) {
    try {
        query = queries.getAllPointsQuery();
        DButilsAzure.execQuery(query)
            .then(function (result) {
                var points = [];
                for (var i = 0; i < result.length; i++) {
                    points.push(result[i])
                }
                res.json({
                    success: true,
                    message: 'POI was granted',
                    POI: points
                });
            })
            .catch(function (err) {
                res.status(500).send('Error In POI Retrival');
            })
    } catch{
        res.status(500).send("Oops... There was an error");
    }
})

router.get('/getPopularPoints', function (req, res) {
    try {
        var rank = req.query.minimalRank;

        //check that all paramters was given
        if (!rank) {
            res.status(500).send('missing paramters');
            return;
        }

        query = queries.getPopularPointsQuery(rank);
        DButilsAzure.execQuery(query)
            .then(function (result) {
                var points = [];
                for (var i = 0; i < result.length; i++) {
                    points.push(result[i])
                }
                res.json({
                    success: true,
                    message: 'POI was granted',
                    POI: points
                });
            })
            .catch(function (err) {
                res.status(500).send('Error In POI Retrival');
            })
    } catch{
        res.status(500).send("Oops... There was an error");
    }
})

router.get('/getInfoPoint', function (req, res) {
    try {
        var pointID = req.query.pointID;

        //check that all paramters was given
        if (!pointID) {
            res.status(500).send('missing paramters');
            return;
        }

        query = queries.getPointInfoQuery(pointID);
        DButilsAzure.execQuery(query)
            .then(function (result) {
                var points = [];
                for (var i = 0; i < result.length; i++) {
                    points.push(result[i])
                }
                query = queries.getPointReviewQuery(pointID)
                DButilsAzure.execQuery(query)
                    .then(function (result) {
                        var reviews = [];
                        for (var i = 0; i < result.length; i++) {
                            reviews.push(result[i])
                        }
                        res.json({
                            success: true,
                            message: 'POI Info was granted',
                            POI: points,
                            reviews: reviews
                        })
                    })
                    .catch(function (err) {
                        res.status(500).send('Error In Review Retrival');
                    })
            })
            .catch(function (err) {
                res.status(500).send('Error In POI Retrival');
            })
    } catch{
        res.status(500).send("Oops... There was an error");
    }
})


router.get('/getPopularPointsByCategory', function (req, res) {
    try {
        category = req.body.category;
        //check that all paramters was given
        if (!category) {
            res.status(500).send('missing paramters');
            return;
        }
        
        category = "('" + category + "')";
        query = queries.getPointsByCategoryQuery(category, 1000);
        DButilsAzure.execQuery(query)
            .then(function (result) {
                var points = [];
                for (var i = 0; i < result.length; i++) {
                    points.push(result[i])
                }
                res.json({
                    success: true,
                    message: 'POI Info was granted',
                    POI: points,
                })
            })
            .catch(function (err) {
                res.status(500).send('Error In POI Retrival');
            })
    } catch{
        res.status(500).send("Oops... There was an error");
    }
})