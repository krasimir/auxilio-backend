var fs = require("fs");
var read = function(file, callback) {
	var res = {};
	try {
		res.content = fs.readFileSync(file).toString();
		console.log(res.content);
	} catch(e) {
		console.log(e);
		callback({error: e});
	}
	callback(res);
}
var write = function(file, content, callback) {
	try {
		fs.writeFile(file, content.toString(), { encoding: 'utf8' }, function(err) {
			if(err) {
				callback({error: e});
			} else {
				callback({content: 'File <b>' + file + '</b> saved successfully.'});
			}
		});
	} catch(e) {
		console.log(e);
		callback({error: e});
	}
}
module.exports = {
	read: read,
	write: write
}