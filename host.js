
var express = require('express');
var app = express();
var fs = require('fs');
var path = "C:/Users/m543015/Desktop/GitHub/hellatomb";
app.use(express.static('public'));


app.get('/*', function (req, res) {
  res.sendFile(__dirname + req.url);
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
