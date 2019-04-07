var accept_user = function (req, res, Task) {
	Task.findOne({
		_id: req.headers['id']
	}, (err, task) => {
		if (err) {
			res.json({
				success: false,
				result: err
			});
		}
		console.log("accepted user:", req.headers['id']);
		task.acceptedUser = req.headers['name'];
		task.save((err, result) => {
			if (err) throw err;
		});
		res.json({
			"success": true,
			"result": "success"
		});
	});
}
module.exports = accept_user;