var decline_task = function (req, res, Task, Response) {

	var task = Task.update({
		_id: req.headers['id']
	}, {
		$set: {
			acceptedUsers: []
		}
	}, (err, result) => {
		if (err) throw err;
		res.json({
			success: true
		});
	});
}
module.exports = decline_task;