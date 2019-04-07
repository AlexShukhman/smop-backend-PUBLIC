var update_task = function (req, res, Task) {
	var task = Task.findOne({
		_id: req.body.id
	}, (err, task) => {
		if (err) {
			res.json({
				success: false
				, result: err
			});
		}
		task.name = req.body.name;
		task.lang = req.body.lang;
		task.task.message_short = req.body.task_message_short;
		task.task.message_long = req.body.task_message_long;
		task.task.pet_code = req.body.task_pet_code;
		task.task.unit_tests = req.body.task_unit_tests;
		task.bounty = req.body.bounty;
		task.save((err, result) => {
			if (err) throw err;
			console.log('updated task');
			res.json({
				success: true
				, result: result
			});
		});
	});
}
module.exports = update_task;