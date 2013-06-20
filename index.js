#!/usr/local/bin/node

var port = 3443;
var io = require('socket.io').listen(port);
var exec = require('child_process').exec;
var fs = require("fs");
var path = require("path");

var readdir = function(dir) {
	return fs.readdirSync(dir);
}

io.sockets.on('connection', function (socket) {

	var execCommand = function(command, data) {
		exec(command, function (error, stdout, stderr) {
			var result = {
				stdout: stdout, 
				stderr: stderr, 
				command: command,
				context: process.cwd(),
				files: readdir(process.cwd())
			};
			socket.emit("result", result);
		});
	}
	var emitError = function(err, command) {
		var result = {
			stdout: '', 
			stderr: err, 
			command: command,
			context: process.cwd(),
			files: readdir(process.cwd())
		};
		socket.emit("result", result);
	}
	var emitMessage = function(str, command) {
		var result = {
			stdout: '', 
			stderr: str, 
			command: command,
			context: process.cwd(),
			files: readdir(process.cwd())
		};
		socket.emit("result", result);
	}

	socket.emit('welcome', {
		context: process.cwd(),
		files: readdir(process.cwd())
	});
	socket.on('command', function (data) {
		if(data.command) {
			var command = data.command.toString();
			var commandParts = command.split(" ");
			var commandName = commandParts.shift();
			if(commandName === "cd") {
				try {
				  	process.chdir(commandParts.join(" "));
				  	emitMessage('', command);
				} catch (err) {
				  	emitError(err.toString(), command);
				}
			} else {
				execCommand(command, data);
			}
		} else {
			socket.emit("result", {error: "Missing command."});
		}
	});
});

// godlike :)
process.on('uncaughtException', function(err) {
  	console.log('Caught exception: ' + err);
});