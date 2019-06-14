var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
app.use(cors());
var DButilsAzure = require('./SqlHelper/DButils');
var jwt  = require('jsonwebtoken');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var port = 3000;
app.listen(port, function () {
    console.log('http://localhost:' + port);
});



// models
var usersPOI = require('./Model/usersPOI');
app.use('/usersPOI',usersPOI);
var users=require('./Model/users');
app.use('/users',users);
var POI = require('./Model/POI');
app.use('/POI',POI);