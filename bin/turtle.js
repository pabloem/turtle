#!/usr/bin/env node
var HanjaServer = require('../lib/HanjaServer.js'),
    sys = require('sys'),
    serv = require('http'),
    express = require('express'),
    fs = require('fs');

var app = express();
app.enable('trust proxy');

var args = process.argv.slice(2);
if(args.length < 1 || args.length > 3) {
    console.log("Usage: ./turtle.js config.json");
    return process.exit(1);
}
var configFile = args[0],
    config = JSON.parse(fs.readFileSync(configFile));

console.log("Read new configuration: ");
console.log(config);

var hs = new HanjaServer({ 'graphFile' : config.graphFile,
                           'dictFile' : config.dictFile});

var __dirname = config.siteDir;
app.get('/runquery', function(req,res) { hs.handleQuery(req,res); });
app.get('/demoquery', function(req,res) { req.headers.query = 'search as'; hs.handleQuery(req,res); });
app.get('/facebook', function(req,res) { console.log("IP of bad guy: "); console.log(req.ip);
                                         res.writeHeader(200,{"Content-Type": "text/html; charset=utf-8"});
                                         res.end(); });
app.use(express.static(__dirname));
app.listen(config.listenPort);

console.log('Start');
