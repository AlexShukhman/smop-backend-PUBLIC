var get_info = function (req, res, UserInfo) {
	var name = req.headers['x-access-name'];
	var typeuser = req.headers['coderowner']
	UserInfo.findOne({
		name: name
	}, function (err, object) {
		if (err) throw err;
		if (!object) {
			res.json({
				success: false
				, message: 'User not found'
			});
		}
		else if (object) {
			if (object.info) {
				if (object.info.typeuser) {
					res.json({
						success: true
						, message: 'info acquired'
						, info: object.info
					});
				}
				else {
					res.json({
						success: true
						, message: 'no info found'
						, info: '//this is where you edit your info'
					});
				}
			}
			else {
				res.json({
					success: true
					, message: 'no info found'
					, info: '//this is where you edit your info'
				});
			}
		}
	});
}
module.exports = get_info;