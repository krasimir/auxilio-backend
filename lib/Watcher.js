var fs = require("fs"),
	jshint = require('jshint').JSHINT,
	path = require('path'),
	fs = require('fs');

var runJSHINT = function(filePath, fileContent) {
	if(path.extname(filePath).toLowerCase() === '.js') {
		if(!jshint(fileContent, require("./JSHintOptions"))) {
			return jshint.data();
		}
	}
	return false;
}

module.exports = function() {
	return {

		socket: null,
		watchr: null,
		watching: [],
		id: 0,

		init: function(s) {
			var self = this;
			this.socket = s;
			this.socket.on("watch", function(data) {
				if(self[data.operation]) {
					self[data.operation](data.parameter, data.auxilioId);
				}
			});
			this.watchr = require('watchr');
			return this;
		},
		list: function() {
			var arr = [];
			for(var i=0; i<this.watching.length; i++) {
				arr.push({
					path: this.watching[i].path,
					id: this.watching[i].id,
					auxilioId: this.watching[i].auxilioId
				})
			}
			this.socket.emit("watch-list", {
				watchers: arr
			});
		},
		start: function(pathToWatch, auxilioId) {
			var alreadyWatching = false,
				self = this,
				pathToWatch = this.resolvePath(pathToWatch);
			if(!pathToWatch) {
				this.socket.emit("error", {
					stdout: '',
					stderr: 'The path <i>' + pathToWatch + '</i> does not exists.'
				});
				return;
			}
			for(var i=0; i<this.watching.length; i++) {
				if(this.watching[i].path === pathToWatch) {
					alreadyWatching = true;
					this.watching[i].auxilioId = auxilioId;
				}
			}
			if(!alreadyWatching) {
				var id = ++this.id;
				this.watchr.watch({
					path: pathToWatch,
					listeners: {
						change: function(changeType, filePath, fileCurrentStat, filePreviousStat){
							var fileContent = fs.readFileSync(filePath).toString();
							self.socket.emit('watch-change', {
								id: id,
								changeType: changeType,
								filePath: filePath,
								auxilioId: self.getAuxilioIdById(id),
								jshint: runJSHINT(filePath, fileContent)
							});
					    }
					},
				    next: function(err, watchers) {
						self.watching.push({
							path: pathToWatch,
							id: id,
							watcher: watchers.length ? watchers[0] : watchers,
							auxilioId: auxilioId
						});
						self.socket.emit("watch-started", {
							path: pathToWatch
						});
				    }
				});
			} else { 
				self.socket.emit("watch-started", {
					path: pathToWatch
				});
			}
		},
		stop: function(id) {
			var arr = [];
			var found = false;
			for(var i=0; i<this.watching.length; i++) {
				if(this.watching[i].id.toString() === id.toString()) {
					this.watching[i].watcher.close();
					this.socket.emit("watch-stopped", {
						path: this.watching[i].path
					});
					found = true;
				} else {
					arr.push(this.watching[i]);
				}
			}
			this.watching = arr;
			if(!found) {
				this.socket.emit("error", {
					stdout: '',
					stderr: 'There is no watcher with id ' + id
				});
			}
		},
		stopall: function() {
			for(var i=0; i<this.watching.length; i++) {
				this.watching[i].watcher.close();
			}
			this.socket.emit("watch-stopped-all", {
				
			});
			this.watching = [];
		},
		resolvePath: function(pathToWatch) {
			if(fs.existsSync(process.cwd() + "/" + pathToWatch)) {
				return process.cwd() + "/" + pathToWatch;
			} else if(fs.existsSync(pathToWatch)) {
				return pathToWatch;
			} else {
				return false;
			}
		},
		getAuxilioIdById: function(id) {
			for(var i=0; i<this.watching.length; i++) {
				if(this.watching[i].id.toString() === id.toString()) {
					return this.watching[i].auxilioId;
				}
			}
			return null;
		}
	}
}