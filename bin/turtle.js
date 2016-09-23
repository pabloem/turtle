#!/usr/bin/env node
var HanjaServer = require('../lib/HanjaServer.js'),
    sys = require('sys'),
    serv = require('http'),
    express = require('express'),
    fs = require('fs'),
    cluster = require('cluster');

var args = process.argv.slice(2);
if(args.length < 1 || args.length > 3) {
  console.log("Usage: ./turtle.js config.json workers");
  return process.exit(1);
}
var workers = parseInt(args[1]) || 1;

if(cluster.isMaster || workers != 1) {
    for(var i = 0; i < workers; i++) {
        cluster.fork();
    }

    cluster.on('exit',function(worker) {
        console.log("We lost worker: " +worker.id);
        cluster.fork();
    });
} else {
    var app = express();
    app.enable('trust proxy');
    var configFile = args[0],
        config = JSON.parse(fs.readFileSync(configFile));

    console.log("Read new configuration: ");
    console.log(config);

    var hs = new HanjaServer({ 'graphFile' : config.graphFile,
                               'dictFile' : config.dictFile});

    var __dirname = config.siteDir;
  app.get('/runquery', function(req,res) { hs.handleQuery(req,res); });
  app.get('/demoquery', function(req,res) { req.headers.query = 'search as'; hs.handleQuery(req,res); });
  app.get('/feedback', function(req,res) { if(req.query.name == "") return;
                                           var chunk = "Name: "+req.query.name+"\n"+
                                               "Email: "+req.query.email+"\n"+
                                               "Comment: {"+req.query.comment+"}\n\n";
                                           fs.stat("feedback.txt",function(err,stat) {
                                             if(err || stat.size < 1000000000) { // If the file doesn't exist or is less than 1GB
                                               fs.appendFile("feedback.txt",chunk,function(err){});
                                             }
                                           });
                                           // req.query is a dictionary with the parsed variables!
                                           res.writeHeader(200,{"Content-Type": "text/html; charset=utf-8"});
                                           res.end(); });
    app.get('/facebook', function(req,res) { console.log("IP of bad guy: "); console.log(req.ip);
                                             res.writeHeader(200,{"Content-Type": "text/html; charset=utf-8"});
                                             res.end(); });
    app.use(express.static(__dirname));
    app.listen(config.listenPort);
}
console.log('Start');
