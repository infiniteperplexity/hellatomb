
var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var path = "C:/Users/m543015/Desktop/GitHub/hellatomb";
app.use(express.static('public'));
app.use(bodyParser.json());

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
    console.log(data);
  });
});

/*app.post('/*', function (req, res) {
  console.log("Received POST request: " + req.url);
  fs.writeFile("./saves/test.json", JSON.stringify(req.body), function(err) {
    if(err) {
      return console.log(err);
    }
  });
  console.log("The file was saved!");
});*/
app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
