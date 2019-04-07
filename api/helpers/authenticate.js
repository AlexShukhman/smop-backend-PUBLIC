var authenticate = function (User, req, res, crypto, jwt, app) {
	// find the user
	// console.log('HIT FROM CLI')
	User.findOne({
		name: req.body.name
	}, function (err, user) {
		if (err) throw err;
		if (!user) {
			console.log('no user named ' + req.body.name);
			res.json({
				success: false
				, message: 'Authentication failed. User not found.'
			});
		}
		else {
			console.log('User', user.name, "logging in...")
			// check if password matches
			var hash = crypto.createHmac('sha512', user.salt);
			hash.update(req.body.password);
			var value = hash.digest('hex');
			if (user.password != value) {
				console.log('password failed')
				res.json({
					success: false
					, message: 'Authentication failed. Wrong password.'
				});
			}
			else if (!user.verified) {
				console.log('email auth failed')
				res.json({
					success: false
					, message: 'Authentication passed, but email not verified'
				});
			}
			else {
				// if user is found and password is right
				// create a token
				console.log('giving token')
				var token = jwt.sign(user.toJSON(), app.get('superSecret'), {
					expiresIn: 1440 * 60 // expires in 24 hours
				});
				// return the information including token as JSON
				res.json({
					success: true
					, message: 'Enjoy your token!'
					, token: token
				});
			}
		}
	});
}
module.exports = authenticate;