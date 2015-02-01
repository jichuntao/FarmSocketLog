var path = require('path');
var cluster = require('cluster');
var cp = require('child_process');

var appPort = 9125;
var numCPUs = 2;
var connStatus = {};
if (cluster.isMaster) {
	console.log('Main Started');
	// start log
	var log;
	startLog();
	var manager;
	startManager();
	// start worker
	for (var i = 0; i < numCPUs; i++) {
        var p=cluster.fork();
        p.on('message', onMsg);
	}

	//worker manager
    cluster.on('exit', function(worker, code, signal) {
		var exitCode = worker.process.exitCode;
		console.log('Worker:'+worker.process.pid+' died('+exitCode+').restart...');
     	var p=cluster.fork();
        p.on('message', onMsg);
    });

    //process Message
    function onMsg(msg){
    	if(msg.type && msg.type=='conn'){
			connStatus[msg.pid]=msg.count;
			manager.send(connStatus);
    		return;
    	}
    	console.log(msg);
		log.send(msg);
    }

	//startlog function
	function startLog()
	{
		log=cp.fork(__dirname+'/log');
		log.on('exit',function(code){
			console.log('Log is Die-code:'+code);
			startLog();
		});
		log.on('error',function(err){
			console.log('Log is Error:'+err);
		});
	}
	//startManager function
	function startManager()
	{
		manager=cp.fork(__dirname+'/manager.js');
		manager.on('exit',function(code){
			console.log('Manager is Die-code:'+code);
			startManager();
		});
		manager.on('error',function(err){
			console.log('Manager is Error:'+err);
		});
	}
}
else
{
	//worker
	var app = require('./sock');
    app.start(appPort);
}

