var new_user_test = function (Testuser, req, res) { // create a user
	var nick = new Testuser({
		name: req.body.name
		, password: req.body.password
		, salt: req.body.salt
	});
	// save the sample user
	nick.save(function (err) {
		if (err) throw err;
		console.log('User saved successfully');
		res.json({
			success: true
		});
	});
}
module.exports = new_user_test;