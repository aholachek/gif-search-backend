var express = require('express');
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');

var getReactionGifs = require('./getReactionGifs');

var port = process.env.PORT || 4000;

app.use(bodyParser.json());

//allow requests only from my website and localhost
var corsOptions = {
  origin: [/^https:\/\/reaction-gif.firebaseapp.com\/*/]
};

if (process.env.NODE_ENV === 'development') {
  corsOptions.origin.push(/^http:\/\/localhost:.{4}/);
}

app.options('/', cors(corsOptions));

app.post('/', cors(corsOptions), function(req, res) {
  getReactionGifs.getGifs(req.body.data).then(function(results) {
    return res.json(results);
  }, function(error) {
    debugger
    var prettyPrintStack = error.stack.split('\n');
    console.log('error!', prettyPrintStack);
    return res.status(500).send(error.stack);
  });
});

app.listen(port);
