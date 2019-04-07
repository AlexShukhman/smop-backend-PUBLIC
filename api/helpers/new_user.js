var new_user = function (User, req, res, UserInfo, sendVerificationMail) {
	// create a user
	var nick = new User({
		name: req.body.name
		, password: req.body.password
		, salt: req.body.salt
		, admin: req.body.admin
		, email: req.body.email
		, verified: false
	});
	var data = new UserInfo({
		name: req.body.name
		, info: {}
	});
	// save the sample user
	nick.save(function (err) {
		if (err) throw err;
		data.save(function (err) {
			if (err) throw err;
			console.log('User saved successfully, sending verification email');
			User.findOne({
				email: req.body.email,
				name: req.body.name
			}, (err, usr) => {
				if (err) throw err;
				if (!usr) {
					res.json({
						success: false,
						message: 'no user'
					});
				}
				sendVerificationMail(usr.email, usr._id)
			});
			res.json({
				success: true
			});
		});
	});
}
module.exports = new_user;