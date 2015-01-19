var net = require('net');
var xml="<?xml version=\"1.0\"?>" + 
"<!DOCTYPE cross-domain-policy SYSTEM \"http://www.adobe.com/xml/dtds/cross-domain-policy.dtd\">" + 
"<cross-domain-policy>" + 
"<allow-access-from domain=\"*\" to-ports=\"*\" />" + 
"</cross-domain-policy>";

var server = net.createServer(function(c) {
	console.log(c.remoteAddress+':'+c.remotePort+' Server Connected');
  	c.setEncoding('utf8');
  	c.on('end', function() {
   		//console.log('server disconnected');
  	});
  	c.on('data',function(data){
		c.end(xml);
  	});
  
});
server.listen(843, function() { 
 	console.log('Sandbox Start');
});
