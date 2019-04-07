var task_status = function (req, res, Task) {
	Task.findOne({
		_id: req.headers['id']
	}, (err, task) => {
		if (err) throw err;
		if (!task) {
			res.json({
				success: true,
				result: 'Error'
			});
		} else if (task.acceptedUser) {
			if (task.acceptedUser == req.headers['x-access-name']) {
				res.json({
					success: true,
					result: 'Big Win'
				});
			} else {
				res.json({
					success: true,
					result: 'Paid'
				});
			}
		} else if (task.acceptedUsers.length > 2) {
			if (task.acceptedUsers && task.acceptedUsers.indexOf(req.headers['x-access-name']) != -1) {
				res.json({
					success: true,
					result: 'Win'
				});
			} else {
				res.json({
					success: true,
					result: 'Queue Full'
				});
			}
		} else if (task.acceptedUsers.length > 1) {
			if (task.acceptedUsers && task.acceptedUsers.indexOf(req.headers['x-access-name']) != -1) {
				res.json({
					success: true,
					result: 'Win'
				});
			} else {
				res.json({
					success: true,
					result: 'Two'
				});
			}
		} else if (task.acceptedUsers.length > 0) {
			if (task.acceptedUsers && task.acceptedUsers.indexOf(req.headers['x-access-name']) != -1) {
				res.json({
					success: true,
					result: 'Win'
				});
			} else {
				res.json({
					success: true,
					result: 'One'
				});
			}
		} else if (task.started) {
			res.json({
				success: true,
				result: 'Started'
			});
		} else if (task.accepted) {
			res.json({
				success: true,
				result: 'Not Started'
			});
		} else {
			res.json({
				success: true,
				result: 'Not Accepted'
			});
		}
	});
}

module.exports = task_status;

