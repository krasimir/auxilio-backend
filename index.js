#!/usr/local/bin/node

var http = require('http'),
    url = require('url'),
    exec = require('child_process').exec,
    port = 3409;

http.createServer(function (req, res) {
	req.addListener('end', function () {

	});
	var pURL = url.parse(req.url, true);
	var cmd = pURL.query['cmd'];

	res.writeHead(200, {'Content-Type': 'application/json'});

	if(cmd) {
		var child = exec(cmd, function (error, stdout, stderr) {
			var result = '{"stdout":' + stdout + ',"stderr":"' + stderr + '","cmd":"' + cmd + '"}';
			res.end(result + '\n');
		});
	} else {
		var result = '{"stdout":"' + '' + '","stderr":"' + 'cmd is mandatory' + '","cmd":"' + cmd + '"}';
		res.end(result + '\n');
	}  
   
}).listen(port, '127.0.0.1');
console.log('Auxilio is running at http://127.0.0.1:' + port + '/');