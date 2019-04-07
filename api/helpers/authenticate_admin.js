var authenticate = function (User, req, res, crypto, jwt, app) {
    // find the user
    User.findOne({
        name: req.body.name,
        admin: true
    }, function (err, user) {
        if (err) throw err;
        if (!user) {
            console.log('no user named ' + req.body.name);
            res.json({
                success: false,
                message: 'Authentication failed. User not found.'
            });
        } else {
            // check if password matches
            var hash = crypto.createHmac('sha512', user.salt);
            hash.update(req.body.password);
            var value = hash.digest('hex');
            if (user.password != value) {
                res.json({
                    success: false,
                    message: 'Authentication failed. Wrong password.'
                });
            } else if (!user.verified) {
                res.json({
                    success: false,
                    message: 'Authentication passed, but email not verified'
                });
            } else {
                // if user is found and password is right
                // create a token
                var token = jwt.sign(user, app.get('superSecret'), {
                    expiresIn: 1440 * 60 // expires in 24 hours
                });
                // return the information including token as JSON
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                });
            }
        }
    });
}
module.exports = authenticate;