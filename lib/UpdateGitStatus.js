module.exports = function() {
	return function(callback, shell) {
		shell.exec('git status -sb', function(res) {
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
}