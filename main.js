var path = require('path');
var cluster = require('cluster');
var cp = require('child_process');

var appPort = 9125;
var numCPUs = 2;

if (cluster.isMaster) {
	console.log('Main Started');
	// start log
	var log;
	startLog();
	// start worker
	for (var i = 0; i < numCPUs; i++) {
        	var p=cluster.fork();
        	p.on('message', function(msg)	{
				console.log(msg);
				log.send(msg);
			});
	}
	//worker manager
    cluster.on('exit', function(worker, code, signal) {
		var exitCode = worker.process.exitCode;
		console.log('Worker:'+worker.process.pid+' died('+exitCode+').restart...');
     	cluster.fork();
     	var p=cluster.fork();
        p.on('message', function(msg){
			console.log(msg);
			log.send(msg);
		});
    });
    /*
	Object.keys(cluster.workers).forEach(function(id) {
    		cluster.workers[id].on('message', function(msg)	{
			console.log(msg);
			log.send(msg);
		});
  	});
	*/
	//startlog function
	function startLog()
	{
		log=cp.fork(__dirname+'/log');
		console.log('Log Start');
		log.on('exit',function(code){
			console.log('Log is Die-code:'+code);
			startLog();
		});
		log.on('error',function(err){
			console.log('Log is Error:'+err);
		});
	}
}
else
{
	//worker
	var app = require('./sock');
        app.start(appPort);
}

