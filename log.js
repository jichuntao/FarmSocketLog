var fs = require('fs');

var LOG_SAVE_DELAY=5000;

var logFilePath='/mnt/farmSocketLog/';

var logBuff= [];
var dirTemp= {};

setTimeout(wirteLog,LOG_SAVE_DELAY);

process.on('message',function(obj){
	obj.time=getNowTime();
        logBuff.push(obj);
        return;
});

function wirteLog(){
    var tempBuff=logBuff;
	logBuff=[];
	var datePath=getDatePath();
	var logObj={};
	for(var i=0;i<tempBuff.length;i++){
		var obj=tempBuff[i];
		if(!logObj[obj.lang]){
			logObj[obj.lang]='test';
		}
		fs.appendFile(getLogPath(datePath,obj.lang)+obj.uid+'.log',obj.time+'-'+obj.msg+'\n',function(err){
				if(err){console.log(err)};
		});
	}
    setTimeout(wirteLog,LOG_SAVE_DELAY);
}
function getLogPath(datePath,lang){
	var dir=datePath+'/'+lang+'/';
 	if(!dirTemp[dir])
 	{
	 	if(!fs.existsSync(logFilePath+datePath+'/'))
	 	{
		 	fs.mkdirSync(logFilePath+datePath+'/');
	 	}
	 	if(!fs.existsSync(logFilePath+datePath+'/'+lang+'/'))
	 	{
		 	fs.mkdirSync(logFilePath+datePath+'/'+lang+'/');
	 	}
	 	dir=datePath+'/'+lang+'/';
	 	dirTemp[dir]=true;
 	}
 	return logFilePath+dir;	
}
function getNowTime(){
	return new Date().getTime();
}
function getDatePath(){
	var date=new Date();
    var year=date.getFullYear();
    var month=date.getMonth()+1;
    var day=date.getDate();
    return year+'_'+month+'_'+day;
}
console.log('Log Start');