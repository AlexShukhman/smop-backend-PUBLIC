var authenticate_test = function (Testuser, req, res, crypto, jwt, app) {
	// find the user
	Testuser.findOne({
		name: req.body.name
	}, function (err, user) {
		if (err) throw err;
		if (!user) {
			res.json({
				success: false
				, message: 'Authentication failed. User not found.'
			});
		}
		else if (user) {
			// check if password matches
			var hash = crypto.createHmac('sha512', user.salt);
			hash.update(req.body.password);
			var value = hash.digest('hex');
			if (user.password != value) {
				res.json({
					success: false
					, message: 'Authentication failed. Wrong password.'
				});
			}
			else {
				// if user is found and password is right
				// create a token
				var token = jwt.sign(user, app.get('superSecret'), {
					expiresIn: 1440 * 60 // expires in 24 hours
				});
				// return the information including token as JSON
				res.json({
					success: true
					, token: token
				});
			}
		}
	});
}
module.exports = authenticate_test;