var fs = require("fs");
var readdirrecursive = function(dir, ignore) {
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
					res[item] = readdirrecursive(dir + "/" + item, ignore);
				} else {
					res[item] = 'file';
				}
			}
		}
	} catch(e) {
		console.log(e);
		return res;
	}
	return res;
}
module.exports = readdirrecursive;