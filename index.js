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
var readDirRecursive = function(dir, ignore) {
	var res = {};
	try {
		var items = fs.readdirSync(dir);
		for(var i=0; item = items[i]; i++) {
			var ignoreDir = false;
			if(ignore) {
				for(var j=0; dirToIgnore = ignore[j]; j++) {
					if(item === dirToIgnore) ignoreDir = true;
				}
			}
			if(!ignoreDir) {
				var stat = fs.statSync(dir + "/" + item);
				if(stat.isDirectory()) {
					res[item] = readDirRecursive(dir + "/" + item, ignore);
				} else {
					res[item] = 'file';
				}
			}
		}
	} catch(e) {
		return res;
	}
	return res;
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
	socket.emit("result", {
		stdout: '', 
		stderr: err, 
		command: command,
		context: process.cwd(),
		files: readdir(process.cwd()),
		id: id,
		git: gitstatus
	});
}
var emitMessage = function(str, command, id) {
	socket.emit("result", {
		stdout: '', 
		stderr: str, 
		command: command,
		context: process.cwd(),
		files: readdir(process.cwd()),
		id: id,
		git: gitstatus
	});
}
var updateContext = function() {
	socket.emit('updatecontext', {
		context: process.cwd(),
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
		} else {
			gitstatus = {};
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
			emitError("Missing command.");
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
	socket.on("tree", function(data) {
		var dir = data.dir ? process.cwd() + "/" + data.dir : process.cwd();
		var dirs = readDirRecursive(dir, [".git", ".svn"]);
		socket.emit("tree", {result: dirs});
	});

	// updating git information
	var forceUpdateContext = function() {
		setTimeout(function() {
			updateGitStatus(function() {
				updateContext();
				forceUpdateContext();
			});
		}, 5000);
	}	
	forceUpdateContext();

});

// godlike :)
process.on('uncaughtException', function(err) {
  	console.log('Caught exception: ' + err);
});