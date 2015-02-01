var http = require('http');
var url = require('url');
var path = require('path');
var util = require('util');
var data ={};
http.createServer(function (req, res) {
    if (req.method == 'POST') {
        res.writeHead(404);
        res.end();
    }
    else if (req.method == 'GET') {
        handler(req, res);
    }
}).listen(9126);
function handler(req, res) {
    res.writeHead(200);
    for(var key in data){
         res.write('process_'+key+':'+data[key]+'\n');
    }
    res.end(); 
}
process.on('message',function(obj){
    data=obj;
    return;
});
console.log('Manager Start');