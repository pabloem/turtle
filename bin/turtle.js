var HanjaServer = require('../lib/HanjaServer.js'),
    sys = require('sys'),
    serv = require('http'),
    express = require('express');

var app = express();

var hs = new HanjaServer({'graphFile':'../data/kor_graph.graphml'});

var __dirname = "/home/pablo/codes/turtle/site";
app.get('/runquery', function(req,res) { hs.handleQuery(req,res); });
app.get('/demoquery', function(req,res) { req.headers.query = 'search as'; hs.handleQuery(req,res); });
app.use(express.static(__dirname));
app.listen(8090);

console.log('Start');
