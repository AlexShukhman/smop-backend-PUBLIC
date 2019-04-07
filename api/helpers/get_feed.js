var get_feed = function (req, res, Task) {
	var name = req.headers['x-access-name'] || 'root';
	var typeuser = req.headers['coderowner'];
	console.log(name, 'getting feed');
	if (typeuser == 'coder') {
		Task.find({
			lang: {$in: (req.headers.lang).split(', ')}
			, accepted: true // backdoor
			, acceptedUsers: {$exists: true}
			, $where: 'this.acceptedUsers.length<3'
			, acceptedUser: null
			, owner: {$ne: name}
		}, (err, result) => {
			Task.find({
				lang: {$in: (req.headers.lang).split(', ')}
				, accepted: true
				, acceptedUser: name
				, owner: {$ne: name}
			}, (err, result2) => {
				if (err) throw err;
				if (result2 == null) {
					result2 = [];
				}
				else if (result == null) {
					result = [];
				}
				if (result.concat(result2) != []) {
					console.log(result.concat(result2))
					res.json({
						success: true
						, result: result.concat(result2)
					});
				}
				else {
					res.json({
						success: true
						, result: 'No Tasks Found'
					});
				}
			});
		});
	}
	else if (typeuser == 'owner') {
		Task.find({
			owner: name
		}, (err, result) => {
			if (err) throw err;
			if (result != []) {
				res.json({
					success: true
					, result: result
				});
			}
			else {
				res.json({
					success: true
					, result: 'No Tasks Found'
				});
			}
		});
	}
}
module.exports = get_feed;
