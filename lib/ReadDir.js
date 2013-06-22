var fs = require("fs");
module.exports = function(dir) {
	try {
		return fs.readdirSync(dir);
	} catch(e) {
		return ['Wrong path.'];
	}
}