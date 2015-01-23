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
        /*
        var timeout = setTimeout(function(){
        	state ='timeout';
        	closeSocket('timeout');
        },12000);
		*/
		c.setEncoding('utf8');

        c.on('end', function() {
			if(state=='logout' || state=='timeout' || state=='sandbox')
			{
				return;
			}
			
			var endTime=new Date().getTime();
			var time=endTime-loginTime;
			console.log("{'action':'close','time':'"+time+"'}");
			sendLogMessage(uid,lang,"{'action':'close','time':'"+time+"'}");
        });

        c.on('data',function(data){
        	console.log(data);
			if(data.indexOf('login:')==0){
				//clearTimeout(timeout);
				var loginDataArr=data.split('login:');
				if(loginDataArr.length!=2 ){
					//closeSocket('loginError:'+data);
					return;
				}
				tempData=str2json(loginDataArr[1]);
				if(tempData == null){
					//closeSocket('loginError:'+data);
					return;
				} 
				uid=tempData['uid'];
				lang=tempData['lang'];
				loginTime=new Date().getTime();
				state='login';
				sendLogMessage(uid,lang,"{'action':'login','data':'"+netInfo+"'"+",'time':'"+tempData['time']+"'"+",'uid':'"+uid+"'"+"}");
				c.write('ok');
			}
			else if(data.indexOf('logout:')==0){
				var logoutDataArr=data.split('logout:');
				if(logoutDataArr.length!=2 ){
					//closeSocket('logoutError:'+data);
					return;
				}
				tempData=str2json(logoutDataArr[1]);
				if(tempData == null){
					//closeSocket('logoutError:'+data);
					return;
				}
				sendLogMessage(uid,lang,"{'action':'logout'"+",'time':'"+tempData['time']+"',loadingTime:'"+tempData['time']+"'}");
				state='logout';
				c.end("logout");
			}
			else if(uid && lang){
        		state='loading';
				sendLogMessage(uid,lang,data);
				c.write('ok');
			}
			else if(data.indexOf('<policy-file-request/>')==0){
				//clearTimeout(timeout);
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

//start(8800);
exports.start=start;
