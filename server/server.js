var express = require('express');
var bodyParser = require('body-parser');
var fs = require("fs");
var path = require("path");
var crypto = require('crypto');
// var evercookie = require('evercookie');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var session = require('cookie-session');

var app = express();
var httpHeaders = {};
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(bodyParser.json({
  // extended: false,
  // parameterLimit: 10000000000, // experiment with this parameter and tweak
  limit: '500mb'
}));
app.use(function(req, res, next) {
  if (req.url === '/') {
    httpHeaders['accept_language'] = req.headers['accept-language'];
    httpHeaders['accept_documents'] = req.headers['accept'];
    httpHeaders['accept_encoding'] = req.headers['accept-encoding'];

    var ip;
    if (req.headers['x-forwarded-for']) {
      ip = req.headers['x-forwarded-for'].split(",")[0];
    } else if (req.connection && req.connection.remoteAddress) {
      ip = req.connection.remoteAddress;
    } else {
      ip = req.ip;
    }

    var generate_key = function() {
      var sha = crypto.createHash('sha256');
      sha.update(Math.random().toString());
      return sha.digest('hex');
    };
    var isEmpty = function(obj) {
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
          return false;
      }
      return true;
    };

    console.log('is cookies empty? ' + isEmpty(req.cookies));
    if (isEmpty(req.cookies) || !req.cookies.session_id) {
      var session_id = generate_key();
      res.cookie('session_id', session_id, {
        'maxAge': 31536000000
      });
      console.log('generated session_id: ' + session_id);
    } else {
      console.log('cook\'s session_id: ' + req.cookies.session_id);
    }

    httpHeaders['ip_address_from_server'] = ip;
    res.cookie('httpHeaders', JSON.stringify(httpHeaders));
  }
  next();
});
app.use(express.static(__dirname + '/../public'), {
  maxage: 0
});

app.post('/process_post', function(req, res) {

  var reqBody = req.body;
  console.log(reqBody);
  if (reqBody.hasOwnProperty('Error')) {
    try {
      fs.appendFile(__dirname + '/../data/error-log.txt', JSON.stringify(reqBody) + "\n", 'utf8');
      res.send(reqBody);

    } catch (err) {
      console.log(err.message);
    }

  } else {
    try {
      fs.appendFile(__dirname + '/../data/data.txt', JSON.stringify(reqBody) + "\n", 'utf8');
      res.send(reqBody);

    } catch (err) {
      console.log(err.message);
    }

  }


});

var server = app.listen(8081, function() {
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)

});
