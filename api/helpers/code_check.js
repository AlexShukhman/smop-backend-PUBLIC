var code_check = function (req, res, spawn, uint8arrayToString, Task, sendAlert) {
	// console.log('checking...');
	console.log(req.decoded)
	Task.findOne({
		"_id": req.body.id
	}, (err, tests) => {
		// console.log(tests);
		// sends a message to the Python script via stdin
		name = tests.name;
		auto = tests.auto;
		owner = tests.owner;
		bounty = tests.bounty;
		email = tests.email;
		if (!tests || !tests.task.unit_tests) {
			tests = '';
			console.log('no tests found');
		}
		else {
			tests = tests.task.unit_tests;
		}

		var awsName = req.decoded.name;
		var awsKey = req.body.id;

		email = req.decoded.email;
		// console.log(email);
		// res.send('hi')

		if (!auto) {
			sendAlert({
				alert: " New Submission for " + name,
				text: "Task Name: " + name + "\n" + "From: " + awsName + "\n\nThe submission is located in s3 under smop-file-dump/" + awsKey + "/" + awsName
			});
			console.log("email sent (hopefully)");
			res.write("Submission Recieved, we'll get back to you soon on if it passed! Feel free to edit and resubmit anytime!");
		} else {
			// executes 'python3 ./python/pythonBackend.py'
			var child = spawn("python3", ["./python/pythonBackend.py"]);
			var message;
			child.stdin.setEncoding('utf-8');
			child.stdin.write(JSON.stringify([req.body.code, tests, awsName, awsKey, tests, owner]));
			child.stdin.end();
			child.stdout.on('data', (data) => {
				console.log('Data = ' + uint8arrayToString(data));
				message = uint8arrayToString(data);
				// console.log(message)
				res.write(message);
			});
			child.stderr.on('error', (data) => {
				console.log('Error = ' + uint8arrayToString(data));
			});
			child.on('close', (code) => {
				console.log('test process exited with code ' + code);
				console.log(message)
				message = JSON.parse(message);
				if (message.success == 'true') {
					Task.findById(req.body.id, (err, task) => {
						task.success = true;
						task.started = true;
						if (task.acceptedUsers.length == 2) {
							task.acceptedUsers.push(awsName);
							task.accepted = false;
						} else if (task.acceptedUsers.length < 3) {
							task.acceptedUsers.push(awsName);
						}
						//generate reciept
						console.log('making receipt')
						var reciept = spawn("python3", ["./python/reciept.py"]);
						reciept.stdin.setEncoding('utf-8');
						reciept.stdin.write(JSON.stringify([bounty, awsName, email, name, owner]));
						reciept.stdin.end();
						reciept.stdout.on('data', (data) => {
							data = uint8arrayToString(data);
							console.log(data)
						});
						// task.acceptedUser = req.headers['x-access-name'];
						task.save((err, result) => {
							if (err) throw err;
						});
					});
				}
				else {
					Task.findById(req.body.id, (err, task) => {
						task.success = false;
						task.started = true;
						task.save((err, result) => {
							if (err) throw err;
						});
					});
				}
				console.log(message.success);
				if (message.success == 'true') {
					res.write("Success! You passed. This means you're guaranteed some money, we'll get in touch with you soon with your total earnings!");
				} else {
					res.write("Testing returned a failure! Here was the issue: " + message.errors);
				}
				res.end();
			});
		}
	});
}
module.exports = code_check;