auxilio-backend
===============

A simple nodejs server for executing shell comamnds based on GET requests. For example:

	http://127.0.0.1:3409/?cmd=ls

Returns:

	{"stdout":README.md
	index.js
	package.json
	,"stderr":"","cmd":"ls"}