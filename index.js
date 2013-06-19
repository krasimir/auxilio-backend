#!/usr/local/bin/node

var port = 3443;
var io = require('socket.io').listen(port);
var exec = require('child_process').exec;

io.sockets.on('connection', function (socket) {
	socket.emit('welcome', {});
	socket.on('command', function (data) {
		if(data.command) {
			var command = data.command.toString();
			exec(command, function (error, stdout, stderr) {
				var result = {
					stdout: stdout, 
					stderr: stderr, 
					command: command 
				};
				socket.emit("result", result);
			});
		} else {
			socket.emit("result", {error: "Missing command."});
		}
	});
});

// var http = require('http'),
//     url = require('url'),
//     exec = require('child_process').exec,
//     port = 3409;

// http.createServer(function (req, res) {
// 	req.addListener('end', function () {

// 	});
// 	var pURL = url.parse(req.url, true);
// 	var cmd = pURL.query['cmd'];

// 	res.writeHead(200, {'Content-Type': 'application/json'});

// 	if(cmd) {
// 		var child = exec(cmd, function (error, stdout, stderr) {
// 			var result = '{"stdout":' + stdout + ',"stderr":"' + stderr + '","cmd":"' + cmd + '"}';
// 			res.end(result + '\n');
// 		});
// 	} else {
// 		var result = '{"stdout":"' + '' + '","stderr":"' + 'cmd is mandatory' + '","cmd":"' + cmd + '"}';
// 		res.end(result + '\n');
// 	}  
   
// }).listen(port, '127.0.0.1');
// console.log('Auxilio is running at http://127.0.0.1:' + port + '/');