#!/usr/bin/env node

var port = 3443;
var io = require('socket.io').listen(port);
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var fs = require("fs");
var path = require("path");
var carrier = require('carrier');

var readdir = function(dir) {
	try {
		return fs.readdirSync(dir);
	} catch(e) {
		return ['Wrong path.'];
	}
}

io.sockets.on('connection', function (socket) {

	var execCommand = function(command, id) {
		exec(command, {
			encoding: 'utf8',
			maxBuffer: 1020*1024,
		}, function (error, stdout, stderr) {
			var result = {
				stdout: stdout, 
				stderr: stderr, 
				command: command,
				context: process.cwd(),
				files: readdir(process.cwd()),
				id: id
			};
			socket.emit("result", result);
		});
		// var stream = spawn(command);
		// var cstdout = carrier.carry(stream.stdout);
		// var cstderr = carrier.carry(stream.stderr);
		// cstdout.on('line', function(line) {
		// 	var result = {
		// 		stdout: line, 
		// 		stderr: '', 
		// 		command: command,
		// 		context: process.cwd(),
		// 		files: readdir(process.cwd()),
		// 		id: id
		// 	};
		// 	socket.emit("result", result);
  //     	});
  //     	cstderr.on('line', function(line) {
		// 	var result = {
		// 		stdout: '', 
		// 		stderr: line, 
		// 		command: command,
		// 		context: process.cwd(),
		// 		files: readdir(process.cwd()),
		// 		id: id
		// 	};
		// 	socket.emit("result", result);
  //     	});
	}

	var emitError = function(err, command, id) {
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

	var emitMessage = function(str, command, id) {
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
	socket.on('command', function(data) {
		if(data.command) {
			var command = data.command.toString();
			var commandParts = command.split(" ");
			var commandName = commandParts.shift();
			if(commandName === "cd") {
				try {
				  	process.chdir(commandParts.join(" "));
				  	emitMessage('', command, data.id);
				} catch (err) {
				  	emitError(err.toString(), command, data.id);
				}
			} else {
				execCommand(command, data.id);
			}
		} else {
			socket.emit("result", {error: "Missing command.", id: data.id});
		}
	});
	socket.on('readdir', function(data) {
		var dirFiles = readdir(process.cwd() + "/" + data.path);
		var result = {
			stdout: '', 
			stderr: '', 
			command: '',
			context: process.cwd(),
			files: readdir(process.cwd()).concat(dirFiles)
		};
		socket.emit("result", result);
		socket.emit("showhint", {files: dirFiles})
	})
});

// godlike :)
process.on('uncaughtException', function(err) {
  	console.log('Caught exception: ' + err);
});