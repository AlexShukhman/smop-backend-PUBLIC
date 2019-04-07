var get_user = function (User, req, res) {
	User.findOne({
		name: req.headers['user']
	}, (err, user) => {
		if (err) throw err;
		if (user) {
			res.json({
				success: true
				, exists: true
				, message: 'User exists. Username not available.'
			});
		}
		else {
			res.json({
				success: true
				, exists: false
				, message: 'User does not exist. Username is available!'
			});
		}
	});
}
module.exports = get_user;