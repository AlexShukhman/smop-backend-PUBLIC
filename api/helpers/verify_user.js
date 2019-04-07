var verify_user = function (User, req, res) {
	User.findOne({
		_id: req.body._id
	}, (err, usr) => {
		if (err) throw err;
		if (!usr) {
			console.log('no user found');
			res.json({
				success: false
				, message: 'Authentication failed. User not found.'
			});
		}
		else {
			usr.verified = true;
			usr.save((err, usr) => {
				if (err) throw err;
				res.json({
					success: true
				});
			});
		}
	});
}
module.exports = verify_user;