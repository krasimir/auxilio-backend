var spawn = require('child_process').spawn,
	exec = require('child_process').exec,
	OutputFormat = require('./OutputFormat');

// work in progress
var useSpawn = function() {
	var _c = spawn("cmd", ['/Q']),
		_callback = null,
		_command = null;

	_c.stdout.on('data', function (data) {
	  	respond(data, '');
	});
	_c.stderr.on('data', function (data) {
	  	respond('', data);
	});
	_c.on('close', function (code) {
	  	console.log('child process exited with code ' + code);
	});

	var respond = function(stdout, stderr) {		
		if(hasCallbackAndCommand() && validateStdout(stdout)) {
			_callback({
				stdout: stdout.toString(),
				stderr: stderr.toString(),
				end: stdout.toString().indexOf('\r\n') === 0
			});
		}
	}
	var hasCallbackAndCommand = function() {
		return 	typeof _callback != 'undefined' && 
				_callback != null &&
				typeof _command != 'undefined' && 
				_command != null;
	}
	var validateStdout = function(stdout) {
		stdout = stdout.toString();
		if(_command + '\n' != stdout && _command != stdout) {
			var isWin = !!process.platform.match(/^win/);
			if(isWin) {
				return stdout.indexOf("Microsoft Windows") !== 0;
			} else {
				return true;
			}
		} else {
			return false;
		}
	}

	return function(command, callback) {
		console.log("exec", command);
		_command = command;
		_callback = callback;
		_c.stdin.write(command + '\n');
	};
}

var useExec = function() {
	return function(command, callback) {
		exec(command, {
			encoding: 'utf8',
			maxBuffer: 1020*1024,
		}, function (error, stdout, stderr) {
			if(callback) {
				callback({
					stdout: stdout ? OutputFormat.escapeUnixText(stdout) : stdout,
					stderr: stderr ? OutputFormat.escapeUnixText(stderr) : stderr
				})
			}
		});
	}
}

module.exports = function(options) {
	if(!options) options = { type: 'exec'} // spawn or exec
	return {
		exec: options.type == 'exec' ? useExec() : useSpawn()
	}
}