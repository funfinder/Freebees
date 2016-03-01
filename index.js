var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var jwt = require('express-jwt');
var fs = require('fs');
var app = express();

mongoURI = process.env.MONGOLAB_URI || "mongodb://localhost/freebiesnearme";
//to connect to local mongodb
mongoose.connect(mongoURI);

// to directly post to the remote online database, use this connection:
// mongoose.connect("mongodb://master:master@ds061405.mongolab.com:61405/heroku_477ltgkh");

mongoose.connection.once('open', function(){
  console.log('Connected to mongodb');
});

var port = process.env.PORT || 3000;

//set up server logging
app.use(morgan('dev'));

app.use(bodyParser.json({limit: '1mb'}));
//parse x-ww-form-urlencoded encoded req bodies
app.use(bodyParser.urlencoded({limit: '1mb', extended: true}));

//use routes.js
app.use(express.static(__dirname + '/client'));
app.use('/image',express.static(__dirname+'/tmp'));

require('./server/routes')(app);

//create user image folder for store user image
var dir = './tmp';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

app.listen(port);
console.log('Express is listening on port: ' + port);

module.exports = app;
