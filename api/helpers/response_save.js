var response_save = function (Response, req, res) {
	Response.findOne({
		task_id: req.body.id
		, coder: req.headers['x-access-name']
	}, (err, response) => {
		if (err) throw err;
		if (!response) {
			var new_response = new Response({
				coder: req.headers['x-access-name']
				, code: req.body.data
				, lang: 'js'
				, task_id: req.body.id
				, success: false
				, accepted: false
				, cashed: false
			});
			new_response.save(function (err) {
				if (err) throw err;
				console.log('New response saved successfully');
				res.json({
					success: true
				});
			});
		}
		else {
			response.code = req.body.data;
			response.save((err, result) => {
				if (err) throw err;
				console.log('updated response');
				res.json({
					success: true
					, result: result
				});
			});
		}
	});
}
module.exports = response_save;