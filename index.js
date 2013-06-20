#!/usr/bin/env node

var port = 3443;
var io = require('socket.io').listen(port);
var spawn = require('child_process').spawn;
var fs = require("fs");
var path = require("path");
var carrier = require('carrier');

var readdir = function(dir) {
	return fs.readdirSync(dir);
}

io.sockets.on('connection', function (socket) {

	var execCommand = function(command, id) {
		var parts = command.split(" ");
		var stream = spawn(parts.shift(), parts);
		var cstdout = carrier.carry(stream.stdout);
		var cstderr = carrier.carry(stream.stderr);
		cstdout.on('line', function(line) {
			var result = {
				stdout: line, 
				stderr: '', 
				command: command,
				context: process.cwd(),
				files: readdir(process.cwd()),
				id: id
			};
			socket.emit("result", result);
      	});
      	cstderr.on('line', function(line) {
			var result = {
				stdout: '', 
				stderr: line, 
				command: command,
				context: process.cwd(),
				files: readdir(process.cwd()),
				id: id
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
			files: readdir(process.cwd()),
			id: id
		};
		socket.emit("result", result);
	}
	var emitMessage = function(str, command) {
		var result = {
			stdout: '', 
			stderr: str, 
			command: command,
			context: process.cwd(),
			files: readdir(process.cwd()),
			id: id
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
				execCommand(command, data.id);
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