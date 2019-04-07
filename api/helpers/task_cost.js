var task_cost = function (req, res, Task) {
	Task.findOne({
		_id: req.headers['id']
	}, (err, task) => {
		if (err) {
			res.json({
				success: false
				, result: err
			});
		}
		res.json({
			"success": true
			, "result": task.bounty
		});
	});
}
module.exports = task_cost;