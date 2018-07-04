'use strict';
var express = require("express");
var bodyParser = require("body-parser");
var process = require('./process-sms.js');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
 
app.get("/", function(req, res) {
    res.send("<h1>REST API</h1><p>Oh, hi! There's not much to see here - view the code instead</p><script src=\"https://button.glitch.me/button.js\" data-style=\"glitch\"></script><div class=\"glitchButton\" style=\"position:fixed;top:20px;right:20px;\"></div>");
    console.log("Received GET");
  });

app.post("/twilio", function(req, res) {
  var data = req.body;
  console.log(data);
  process.dispatch(data.Body);
});

app.get("/test", function(req, res){
  var data = req.query;
  process.dispatch((data.msg != null) ? data.msg : "TEST");
  res.sendStatus(200);
});

var server = app.listen(3000, function () {
  console.log("Listening on port %s", server.address().port);
});