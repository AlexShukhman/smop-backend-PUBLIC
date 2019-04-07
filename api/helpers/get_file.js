var get_file = function (req, res, s3, Task) {
	var filename = req.headers['file'];
	var params = {
		Bucket: "smop-file-dump",
		Key: req.headers['id'] + '/' + req.headers['x-access-name'] + '/' + filename
	}
	var params1 = {
		Bucket: 'smop-file-dump',
		Prefix: req.headers['id'] + "/"
	}
	s3.listObjects(params1, (err, data) => {
		var keys = []
		for (var i in data.Contents) {
			keys.push(data.Contents[i].Key)
		}
		if (keys.indexOf(params.Key) == -1) {
			Task.findOne({
				_id: req.headers['id']
			}, (err, task) => {
				var params = {
					Bucket: "smop-file-dump",
					Key: req.headers['id'] + '/' + task.owner + '/' + filename 
				}
				var stream = s3.getObject(params).createReadStream().pipe(res);
				stream.on('finish', () => {
					res.end();
				});
			});
		} else {
			var object = s3.getObject(params);
			var stream = object.createReadStream().pipe(res);

			stream.on('finish', () => {
				res.end();
			});

			stream.on('error', (err) => {
				console.log(err)
			});
		}
	});

}



module.exports = get_file;