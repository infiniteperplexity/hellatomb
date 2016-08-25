
var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var path = "C:/Users/m543015/Desktop/GitHub/hellatomb";
app.use(express.static('public'));
app.use(bodyParser.json({limit: '50mb'}));

function serveFile(req, res) {
  res.sendFile(__dirname + req.url);
}
app.get('/', function (req, res) {
  res.sendFile(__dirname +"/index.html");
});
app.get('/*.html', serveFile);
app.get('/*.js', serveFile);
app.get('/*.json', function(req, res) {
  fs.readFile(__dirname + req.url, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }
    res.send(data);
  });
});
app.get('/saves/', function(req, res) {
  fs.readdir(__dirname + '/saves/', function(err, data) {
    if (err) {
      return console.log(err);
    }
    res.send(JSON.stringify(data));
  });
});
app.post('/saves/*.json', function (req, res) {
  console.log("Received POST request: " + req.url);
  fs.writeFile("." + req.url, JSON.stringify(req.body), function(err) {
    if(err) {
      return console.log(err);
    }
  });
  console.log("Saved file "+req.url);
});
app.listen(8080, function () {
  console.log('Example app listening on port 8080.');
});