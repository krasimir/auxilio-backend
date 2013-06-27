var fs = require("fs"),
	jshint = require('jshint').JSHINT,
	path = require('path'),
	fs = require('fs');

var runJSHINT = function(filePath) {
	if(path.extname(filePath).toLowerCase() === '.js') {
		var fileContent = fs.readFileSync(filePath).toString();
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
		start: function(path, auxilioId) {
			var alreadyWatching = false,
				self = this,
				path = this.resolvePath(path);
			if(!path) {
				this.socket.emit("error", {
					stdout: '',
					stderr: 'The path <i>' + path + '</i> does not exists.'
				});
				return;
			}
			for(var i=0; i<this.watching.length; i++) {
				if(this.watching[i].path === path) {
					alreadyWatching = true;
					this.watching[i].auxilioId = auxilioId;
				}
			}
			if(!alreadyWatching) {
				var id = ++this.id;
				this.watchr.watch({
					path: path,
					listeners: {
						change: function(changeType, filePath, fileCurrentStat, filePreviousStat){
							self.socket.emit('watch-change', {
								id: id,
								changeType: changeType,
								filePath: filePath,
								auxilioId: self.getAuxilioIdById(id),
								jshint: runJSHINT(filePath)
							});
					    }
					},
				    next: function(err, watchers) {
						self.watching.push({
							path: path,
							id: id,
							watcher: watchers.length ? watchers[0] : watchers,
							auxilioId: auxilioId
						});
						self.socket.emit("watch-started", {
							path: path
						});
				    }
				});
			} else { 
				self.socket.emit("watch-started", {
					path: path
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
		resolvePath: function(path) {
			if(fs.existsSync(process.cwd() + "/" + path)) {
				return process.cwd() + "/" + path;
			} else if(fs.existsSync(path)) {
				return path; 
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