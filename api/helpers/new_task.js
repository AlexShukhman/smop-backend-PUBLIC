var new_task = function (req, res, Task, sendAlert) {
	var task = new Task({
		name: req.body.name
		, lang: req.body.lang.split(", ")
		, owner: req.headers['x-access-name']
		, task: {
			message_short: req.body.task_message_short
			, message_long: req.body.task_message_long
			, unit_tests: req.body.task_unit_tests
		}
		, bounty: req.body.bounty
		, acceptedUsers: [] // mini bounties
		, acceptedUser: null // big bounty
		, started: false
		, accepted: false // must be accepted
		, auto: true // backdoor
	});
	// save the sample user
	task.save(function (err, t) {
		if (err) throw err;
		sendAlert({
			alert: "New Task",
			text: 'New task saved by ' + req.headers['x-access-name'] + ", please check if it's good and accept on DB"
		}, "smop@smop.io founders@smop.io");
		res.json({
			success: true
			, id: t._id
		});
	});
}
module.exports = new_task;