var single_task = function (req, res, Task, s3) {
	if (req.headers['coder_owner'] == 'owner') {
		Task.findOne({
			_id: req.headers['id']
		}, (err, result) => {
			if (err) throw err;
			var params = {
				Bucket: 'smop-file-dump',
				Prefix: req.headers['id'] + "/"
			}
			s3.listObjects(params, (err, data) => {
				if (err) throw err;
				var regex = /[^/]+/ig
				var OwnerFiles = []
				var candidates = []
				var name
				for (var i in data.Contents) {
					var contents = data.Contents[i]
					name = contents.Key.match(regex)[1];
					if (name == req.headers['x-access-name'] && !contents.Key.match(regex)[3]) {
						OwnerFiles.push(contents.Key);
					}
				}
				for (var i = 0; i<result.acceptedUsers.length; i++){
					candidates.push(result._id+'/'+result.acceptedUsers[i]);
				}

				res.json({
					success: true,
					files: OwnerFiles,
					result: result,
					r: candidates
				});
			});
		});
	} else {
		Task.findOne({
			_id: req.headers['id']
		}, (err, resultIn) => {
			if (err) throw err;
			var params = {
				Bucket: 'smop-file-dump',
				Prefix: req.headers['id'] + "/"
			}
			s3.listObjects(params, (err, data) => {
				if (err) throw err;
				console.log(data);
				var regex = /[^/]+/ig
				var CoderFiles = []
				for (var i in data.Contents) {
					var contents = data.Contents[i]
					if (contents.Key.match(regex)[1] == resultIn.owner && contents.Key.match(regex).length <4) {
						CoderFiles.push(contents.Key);
					}
				}
				res.json({
					success: true,
					result: resultIn,
					accepted: resultIn.acceptedUsers.indexOf(req.headers['x-access-name']) != -1,
					files: CoderFiles
				});
			});

		});
	}
}
module.exports = single_task;