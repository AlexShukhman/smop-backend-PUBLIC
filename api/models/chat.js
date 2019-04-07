// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// set up a mongoose model 
var Chats = new Schema({
    task_id: String,
    user: String,
    owner: String,
    value: String,
    created_at: {
        type: Date
    }
});
// middle ware in serial
Chats.pre('save', function (next) {
    now = new Date();
    this.created_at = now;
    var currentdate = new Date;
    next();
});
// Pass model using module.exports
module.exports = mongoose.model('Chats', Chats);