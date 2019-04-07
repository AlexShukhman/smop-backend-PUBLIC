var parth_test = function (req, res, spawn, exec, uint8arrayToString) {
	var command = "curl -L --retry 20 --retry-delay 2 -vs "+ req.headers.r +"/raw/master/"+ req.headers.p;
	exec(command, (err, stdout, stderr) => {
		if (err || stdout.includes('<script type="text/javascript" src="/_error.js"></script>')) {
			console.log(err);
			res.end('Error, unable to receive parth file, maybe the file was spelled incorrectly? Try using the file notation (e.g. "./views/index.html").');
		}
		else {
			tests = stdout;
			console.log('tests:', tests);
			var child = spawn("python3", ["./python/parthBackend.py"]);
			var message;
			child.stdin.setEncoding('utf-8');
			console.log([req.headers.e, req.headers.t, tests, req.headers.r])
			child.stdin.write(JSON.stringify([req.headers.e, req.headers.t, tests, req.headers.r, req.headers.ip.split(', ')[0]]));
			child.stdin.end();
			child.stdout.on('data', (data) => {
				console.log('Data = ' + uint8arrayToString(data));
				message = uint8arrayToString(data);
				// console.log(message)
				res.write(message);
			});
			child.on('error', (data) => {
				console.log('Error = ' + uint8arrayToString(data));
			});
			child.on('exit', (code, signal) => {
				console.log('test process exited with code ' + code);
				console.log(typeof(code));
				console.log('message', message)
				if (code == 0) {
					message = JSON.parse(message);
					if (message.success) {
						res.end("Success! All tests passed.");
					} else {
						res.end("Testing returned a failure! Here was the issue: " + message.errors);
					}
				}
				else {
					console.log("fail");
					res.end('Request Failed with error code ' + code);
				}
			});
		}
	});
}

module.exports = parth_test;