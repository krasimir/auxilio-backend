#!/usr/bin/env node

var port = 3443,
	io = require('socket.io').listen(port),
	path = require("path"),
	readdir = require('./lib/ReadDir'),
	readdireecursive = require('./lib/ReadDirRecursive'),
	carrier = require('carrier'),
	watcher = require('./lib/Watcher'),
	updateGitStatus = require('./lib/UpdateGitStatus')(),
	Sheller = require('./lib/Sheller'),
	ReadWriteFiles = require('./lib/ReadWriteFiles');


// ******************************************************* socket.io
io.set('log level', 1);
io.sockets.on('connection', function (socket) {

	var w = watcher().init(socket);

	var shell = new Sheller({type: 'exec'}),
		connected = true;

	socket.on('command', function(data) {
		if(data.command) {
			var command = data.command.toString();
			var commandParts = command.split(" ");
			var commandName = commandParts.shift();
			if(commandName === "cd") {
				try {
				  	process.chdir(commandParts.join(" "));
				  	updateContext();
				  	socket.emit("command", {
						stdout: '', 
						stderr: '',
						id: data.id
					});
				} catch (err) {
				  	socket.emit("command", {
						stdout: '', 
						stderr: err.toString(),
						id: data.id
					});
				}
			} else {
				shell.exec(command, function(res) {
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
	socket.on("writefile", function(data) {
		ReadWriteFiles.write(data.file, data.content, function(res) {
			socket.emit("writefile", res);	
		});
	});
	socket.on("readfile", function(data) {
		ReadWriteFiles.read(data.file, function(res) {
			socket.emit("readfile", res);
		});
	});
	socket.on('disconnect', function(data) {
		connected = false;
		w.stopall();
	})

	// updating git information
	var forceUpdateContext = function() {
		if(!connected) return;
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
		}, shell);
	}
	updateContext();

});

// godlike :)
process.on('uncaughtException', function(err) {
  	console.log('Caught exception: ' + err);
});


// testing a shell command with long stdout
// var shell = new Sheller();
// shell.exec('git pull origin master', function(res) {
// 	console.log('--------------------------', res);
// })