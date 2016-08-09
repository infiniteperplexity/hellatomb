
var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var path = "C:/Users/m543015/Desktop/GitHub/hellatomb";
app.use(express.static('public'));
app.use(bodyParser.json());


app.get('/*', function (req, res) {
  res.sendFile(__dirname + req.url);
});

app.post('/*', function (req, res) {
  console.log("Received POST request: " + req.url);
  fs.writeFile("./saves/test.txt", JSON.stringify(req.body), function(err) {
    if(err) {
      return console.log(err);
    }
  });
  console.log("The file was saved!");
});
app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
