#!/usr/bin/env node

var port = 3443,
	io = require('socket.io').listen(port),
	spawn = require('child_process').spawn,
	exec = require('child_process').exec,
	path = require("path"),
	readdir = require('./lib/ReadDir'),
	readdireecursive = require('./lib/ReadDirRecursive'),
	carrier = require('carrier'),
	socket;

var execCommand = function(command, callback) {
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
		}
	});
}
var updateGitStatus = function(callback) {
	execCommand('git status -sb', function(res) {
		var gitstatus = {};
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
		if(callback) callback(gitstatus);
	});
}


// ******************************************************* socket.io
io.sockets.on('connection', function (s) {

	socket = s;

	socket.on('command', function(data) {
		if(data.command) {
			var command = data.command.toString();
			var commandParts = command.split(" ");
			var commandName = commandParts.shift();
			if(commandName === "cd") {
				try {
				  	process.chdir(commandParts.join(" "));
				  	updateContext();		  	
				} catch (err) {
				  	socket.emit("command", {
						stdout: '', 
						stderr: err.toString(),
						id: data.id
					});
				}
			} else {
				execCommand(command, function(res) {
					socket.emit("command", {
						stdout: res.stdout, 
						stderr: res.stderr,
						id: data.id
					});
				});
			}
		}
	});
	socket.on('readdir', function(data) {
		var dirFiles = readdir(process.cwd() + "/" + data.path);
		socket.emit("readdir", { files: dirFiles });
	});
	socket.on("tree", function(data) {
		var dir = data.dir ? process.cwd() + "/" + data.dir : process.cwd();
		var dirs = readdireecursive(dir, [".git", ".svn"]);
		socket.emit("tree", { result: dirs });
	});

	// updating git information
	var forceUpdateContext = function() {
		setTimeout(function() {
			updateContext();
		}, 2000);
	}
	var updateContext = function() {
		updateGitStatus(function(gitstatus) {
			socket.emit('updatecontext', {
				context: process.cwd(),
				git: gitstatus,
				files: readdir(process.cwd())
			});
			forceUpdateContext();
		});
	}
	updateContext();

});

// godlike :)
process.on('uncaughtException', function(err) {
  	console.log('Caught exception: ' + err);
});