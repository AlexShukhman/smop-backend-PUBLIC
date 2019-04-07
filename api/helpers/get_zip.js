var async = require('async');
var get_zip = function (req, res, s3, s3Zip, Task) {
    var path = req.headers['path'].split('/')
    Task.findOne({
        _id: path[0]
    }, (err, task) => {
        if (err) throw err;
        if (!task) console.error('zip error, task does not exit');
        var params = {
            Bucket: 'smop-file-dump',
            Prefix: path[0] + '/' + task.owner
        }
        s3.listObjects(params, (err, data) => {
            var n = Math.round(Math.random() * 10000000); // fake folder name
            async.each(data.Contents, function (file, cb) {
                console.log(file.Key);
                var params = {
                    Bucket: 'smop-file-dump',
                    CopySource: 'smop-file-dump/' + file.Key,
                    Key: path[0] + '/' + n + '/' + file.Key.split('/')[2]
                }
                s3.copyObject(params, function (copyErr, copyData) {
                    if (copyErr) {
                        console.log('copyerr1', copyErr);
                    } else {
                        console.log('Copied: ', params.Key);
                        cb();
                    }
                });
            }, (err, data) => {
                var params = {
                    Bucket: 'smop-file-dump',
                    Prefix: path[0] + '/' + path[1]
                }
                s3.listObjects(params, (err, data) => {
                    async.each(data.Contents, (file, cb) => {
                        var params = {
                            Bucket: 'smop-file-dump',
                            CopySource: 'smop-file-dump/' + file.Key,
                            Key: path[0] + '/' + n + '/' + file.Key.split('/')[2]
                        }
                        s3.copyObject(params, function (copyErr, copyData) {
                            if (copyErr) {
                                console.log('copyerr2', copyErr);
                            } else {
                                console.log('Copied: ', params.Key);
                                cb();
                            }
                        });
                    }, (err, data) => {
                        if (err) throw err;
                        s3Zip.streamZipDataTo({
                            pipe: res,
                            folderName: path[0] + '/' + n,
                            recursive: true
                        }, (err, res) => {
                            if (err) throw err;
                            console.log(res);
                            var params = {
                                Bucket: 'smop-file-dump',
                                Prefix: path[0] + '/' + n
                            }
                            s3.listObjects(params, (err, data) => {
                                var params = {
                                    Bucket: 'smop-file-dump'
                                }
                                params.Delete = {
                                    Objects: []
                                }
                                data.Contents.forEach(function (content) {
                                    params.Delete.Objects.push({
                                        Key: content.Key
                                    });
                                });
                                s3.deleteObjects(params, function(err, data) {
                                    if (err) throw err;
                                    else console.log(data);
                                  });
                            });
                        });
                    });
                });
            });
        });
    });
}
module.exports = get_zip;