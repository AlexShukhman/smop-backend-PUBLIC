var pet_code = function (req, res, fs, s3, Task) {
	console.log('file ' + req.body.name + " is uploading to S3...");
	var uploadParams = {
		Bucket: 'smop-file-dump',
		Key: '',
		Body: ''
	};
	var file = 'public/uploads/' + req.files[0].filename;
	var filestream = fs.createReadStream(file);
	filestream.on('error', (err) => {
		console.error('FILE ERROR -- ', err);
	});
	uploadParams.Body = filestream;
	uploadParams.Key = req.body.id + '/' + req.headers['x-access-name'] + '/' + req.body.name;
	s3.upload(uploadParams, (err, data) => {
		if (err) console.error(err);
		if (data) {
			fs.unlinkSync('public/uploads/' + req.files[0].filename);
			Task.findOne({
				_id: req.body.id
			}, (err, task) => {
				if (err) throw err;
				if (task.owner != req.headers['x-access-name'] && !task.started){
					task.started = true;
					task.save()
				}
				res.json({
					success: true,
					name: req.body.name
				});
			});
		}
	});
}
module.exports = pet_code;