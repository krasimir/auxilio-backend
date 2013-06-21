#!/usr/bin/env node

var port = 3443;
var io = require('socket.io').listen(port);
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var fs = require("fs");
var path = require("path");
var carrier = require('carrier');
var socket;
var gitstatus = {};

var readdir = function(dir) {
	try {
		return fs.readdirSync(dir);
	} catch(e) {
		return ['Wrong path.'];
	}
}
var execCommand = function(command, id, callback) {
	exec(command, {
		encoding: 'utf8',
		maxBuffer: 1020*1024,
	}, function (error, stdout, stderr) {
		if(callback) {
			callback({
				error: error,
				stdout: stdout,
				stderr: stderr
			})
		} else {
			var result = {
				stdout: stdout, 
				stderr: stderr, 
				command: command,
				context: process.cwd(),
				files: readdir(process.cwd()),
				id: id,
				git: gitstatus
			};
			socket.emit("result", result);
		}
	});
}
var emitError = function(err, command, id) {
	var result = {
		stdout: '', 
		stderr: err, 
		command: command,
		context: process.cwd(),
		files: readdir(process.cwd()),
		id: id,
		git: gitstatus
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
		id: id,
		git: gitstatus
	};
	socket.emit("result", result);
}
var updateContext = function() {
	socket.emit('updatecontext', {
		context: process.cwd(),
		files: readdir(process.cwd()),
		git: gitstatus
	});
}
var updateGitStatus = function(callback) {
	execCommand('git status -sb', '', function(res) {
		if(res.error == null && res.stdout != '') {
			var gitStatusResult = res.stdout;
			var lines = gitStatusResult.split("\n");
			var branch = '';
			var status = {};
			for(var i=0; i<lines.length; i++) {
				var line = lines[i];
				if(i == 0) {
					branch = line.replace("## ", '');
				} else {
					var parts = line.split(" ");
					if(parts.length >= 2) {
						var type = parts.length == 2 ? parts[0] : parts[1];
						if(!status[type]) status[type] = 0;
						status[type] += 1;
					}
				}
			}
			gitstatus = {
				branch: branch,
				status: status
			};
		}
		if(callback) callback();
	});
}


// ******************************************************* socket.io
io.sockets.on('connection', function (s) {

	socket = s;

	updateGitStatus(function() {
		socket.emit('welcome', {
			context: process.cwd(),
			files: readdir(process.cwd()),
			git: gitstatus
		});
	});
	socket.on('command', function(data) {
		if(data.command) {
			var command = data.command.toString();
			var commandParts = command.split(" ");
			var commandName = commandParts.shift();
			if(commandName === "cd") {
				try {
				  	process.chdir(commandParts.join(" "));
				  	updateGitStatus(function() {
				  		emitMessage('', command, data.id);
				  	});				  	
				} catch (err) {
				  	emitError(err.toString(), command, data.id);
				}
			} else {
				execCommand(command, data.id);
			}
		} else {
			socket.emit("result", {
				error: "Missing command.", 
				id: data.id,
				git: gitstatus
			});
		}
	});
	socket.on('readdir', function(data) {
		var dirFiles = readdir(process.cwd() + "/" + data.path);
		var result = {
			stdout: '', 
			stderr: '', 
			command: '',
			context: process.cwd(),
			files: readdir(process.cwd()).concat(dirFiles),
			git: gitstatus
		};
		socket.emit("result", result);
		socket.emit("showhint", {
			files: dirFiles,
			git: gitstatus
		});
	});

	// updating git information
	var forceUpdateContext = function() {
		setTimeout(function() {
			updateGitStatus(function() {
				updateContext();
				forceUpdateContext();
			});
		}, 7000);
	}	
	forceUpdateContext();

});

// godlike :)
process.on('uncaughtException', function(err) {
  	console.log('Caught exception: ' + err);
});