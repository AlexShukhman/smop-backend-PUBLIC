// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// set up a mongoose model 
var TaskFile = new Schema({
	name: String
	, file: Buffer
	, owner: String
	, task_id: String
	, created_at: {
		type: Date
	}
	, updated_at: {
		type: Date
	}
});
// middle ware in serial
TaskFile.pre('save', function (next) {
	now = new Date();
	this.updated_at = now;
	if (!this.created_at) {
		this.created_at = now;
	}
	var currentdate = new Date;
	this.date = currentdate.now;
	this.__v = this.__v + 1;
	next();
});
// Pass model using module.exports
module.exports = mongoose.model('TaskFile', TaskFile);