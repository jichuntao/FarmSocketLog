var net = require('net');
var xml="<?xml version=\"1.0\"?>" +
"<!DOCTYPE cross-domain-policy SYSTEM \"http://www.adobe.com/xml/dtds/cross-domain-policy.dtd\">" +
"<cross-domain-policy>" +
"<allow-access-from domain=\"*\" to-ports=\"*\" />" +
"</cross-domain-policy>";

function start(port){
        var server = net.createServer(function(c) {
		var netInfo=c.remoteAddress+':'+c.remotePort;
		var state='Connected';
		var uid;
		var lang;
        var tempData;
        var loginTime;
        var offsetTime;

		c.setEncoding('utf8');

        c.on('end', function() {
			if(state=='logout' || state=='timeout' || state=='sandbox')
			{
				return;
			}
			var logobj={};
			logobj['action']='close';
			logobj['time']=new Date().getTime()-loginTime;
			sendLogMessage(uid,lang,JSON.stringify(logobj));
        });

        c.on('error',function(e){
			var logobj={};
			logobj['action']='error';
			logobj['time']=new Date().getTime()-loginTime;
			logobj['msg']=e.code;
			sendLogMessage(uid,lang,JSON.stringify(logobj));
        });

        c.on('data',function(data){
			if(data.indexOf('login:')==0){
				var loginDataArr=data.split('login:');
				if(loginDataArr.length!=2 ){
					return;
				}
				tempData=str2json(loginDataArr[1]);
				if(tempData == null){
					return;
				} 
				state='login';
				uid=tempData['uid'];
				lang=tempData['lang'];
				offsetTime=tempData['time'];
				loginTime=new Date().getTime()-offsetTime;

				var logobj={};
				logobj['action']='login';
				logobj['data']=netInfo;
				logobj['time']=offsetTime;
				logobj['uid']=uid;
				sendLogMessage(uid,lang,JSON.stringify(logobj));

				c.write('ok');
			}
			else if(data.indexOf('logout:')==0){
				var logoutDataArr=data.split('logout:');
				if(logoutDataArr.length!=2 ){
					return;
				}
				tempData=str2json(logoutDataArr[1]);
				if(tempData == null){
					return;
				}
				state='logout';
				var logobj={};
				logobj['action']='logout';
				logobj['time']=tempData['time'];
				sendLogMessage(uid,lang,JSON.stringify(logobj));

				c.end("logout");
			}
			else if(uid && lang){
        		state='loading';
				sendLogMessage(uid,lang,data);
				c.write('ok');
			}
			else if(data.indexOf('<policy-file-request/>')==0){
				state='sandbox';
				c.end(xml);
				return;
			}
			else
			{
				return;
			}
        });

		function closeSocket(msg){
			console.log(msg);	
			c.end('error');
			return;
		}
        });

        server.listen(port,function() {
            console.log(process.pid+' port:'+port+' Listen Start');
        });
        setInterval(sendConns,10000);
		function sendConns(){
			server.getConnections(function(err,count){
				if(!err){
					process.send({'type':'conn','pid':process.pid,'count':count});
				}
			});
		}
		function sendLogMessage(uid,lang,msg){
			process.send({'uid':uid,'lang':lang,'msg':msg});
		}
		function str2json(str){
			var ret;
			try{
				ret = JSON.parse(str);
			}
			catch(e){
				ret = null;
			}
			return ret;
		}
}

exports.start=start;
