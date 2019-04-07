// =======================
// get packages ==========
// =======================
var qs = require('querystring');
var fs = require('fs');
var express = require('express');
var sys = require('sys');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
// start the server ======
// =======================
var hostname = "localhost";
var app = express();
var port = process.env.PORT || 3001;
var server = require('http').createServer(app);
var io = require('socket.io')(server);
server.listen(port, () => {
	console.log('Server listening at port %d', port);
});
var crypto = require('crypto');
var bodyParser = require('body-parser');
var multer = require('multer');
var exec = require('child_process').exec;
var upload = multer({
	dest: 'public/uploads/',
	onFileUploadComplete: function (file, req, res) {
		console.log("FILE UPLOAD IS COMPLETE");
	}
});
var morgan = require('morgan');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
const Email = require('email-templates');
var mailerCreds = require('./api/credentials/mailerCreds')
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get config file
var Chat = require('./api/models/chat');
var Testuser = require('./api/models/testuser');
var User = require('./api/models/user');
var UserInfo = require('./api/models/userinfo');
var Task = require('./api/models/task');
var TaskFile = require('./api/models/taskfile');
var paypal = require('paypal-rest-sdk');
var AWS = require('aws-sdk');
// =======================
// helpers ===============
// =======================
var helpers = './api/helpers/';
var accept_user = require(helpers + 'accept_user');
var authenticate_admin = require(helpers + 'authenticate_admin');
var authenticate_test = require(helpers + 'authenticate_test');
var authenticate = require(helpers + 'authenticate');
var code_check = require(helpers + 'code_check');
var decline_task = require(helpers + 'decline_task');
var email_alert = require(helpers + 'email_alert');
var get_feed = require(helpers + 'get_feed');
var get_file = require(helpers + 'get_file');
var get_info = require(helpers + 'get_info');
var get_user = require(helpers + 'get_user');
var get_zip = require(helpers + 'get_zip');
var new_task = require(helpers + 'new_task');
var new_user_test = require(helpers + 'new_user_test');
var new_user = require(helpers + 'new_user');
var parth_test = require(helpers + 'parth_test');
var pay_coder = require(helpers + 'pay_coder');
var payout = require(helpers + 'payout');
var pet_code = require(helpers + 'pet_code');
var response_save = require(helpers + 'response_save');
var single_task = require(helpers + 'single_task');
var task_cost = require(helpers + 'task_cost');
var task_status = require(helpers + 'task_status');
var token_middleware = require(helpers + 'token_middleware');
var update_task = require(helpers + 'update_task');
var verify_user = require(helpers + 'verify_user');
var cliPull = require(helpers + 'cli_pull')
// =======================
// configuration =========
// =======================
AWS.config.loadFromPath('./api/credentials/aws-config.json');
s3 = new AWS.S3({
	apiVersion: '2006-03-01'
});
var awss3zip = require('aws-s3-zipper');
var creds = require('./api/credentials/aws-config.json')
var s3Zip = new awss3zip({
	"accessKeyId": creds["accessKeyId"],
	"secretAccessKey": creds["secretAccessKey"],
	"region": creds["region"],
	"bucket": "smop-file-dump"
});
mongoose.Promise = require('bluebird');
mongoose.Promise = global.Promise;
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable
// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());
// use morgan to log requests to the console
app.use(morgan('dev'));
// create user
var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: mailerCreds.user,
		pass: mailerCreds.pass
	}
});
// Function to convert an Uint8Array to a string
var uint8arrayToString = function (data) {
	return String.fromCharCode.apply(null, data);
};

function sendVerificationMail(email, _id) {

	var mailBody = {
		from: 'noreply@smop.io',
		to: email,
		subject: 'Please Verify Your Email',
		text: 'Hello There!\n\tPlease click this link to verify your email by clicking https://smop.io/verify_email?_id=' + _id + ' <-- there. \n(This link is safe to click)'
	}

	transporter.sendMail(mailBody, (err, result) => {
		if (!err) console.log(result);
		else console.log(err);
	});
}

function sendForgotMail(email, _id) {
	console.log('sending mail...');
	var mailBody = {
		from: 'noreply@smop.io',
		to: email,
		subject: 'Please Follow to Access Your Account',
		text: 'Hello There!\n\tPlease click this link to access your account: https://smop.io/forgot?_id=' + _id + ' <-- there. \n(This link is safe to click)'
	}

	transporter.sendMail(mailBody, (err, result) => {
		if (!err) {
			console.log(result);
		} else {
			console.log(err);
		}
	});
}

function sendAlert(info, recipient) {
	var mailBody = {
		from: 'noreply@smop.io',
		to: (recipient) ? recipient : 'alex@smop.io, jay@smop.io, nyles@smop.io, parth@smop.io',
		subject: 'AUTO ALERT:' + info.alert,
		text: info.text,
	}
	transporter.sendMail(mailBody, (err, result) => {
		console.log(mailBody);
		if (err) console.log(err);
		else console.log(result);
	});
}

// ********** PAYPAL CASH OUT ********** //
var sender_batch_id = Math.random().toString(36).substring(9);
paypal.configure({
	'mode': 'sandbox', //sandbox or live
	'client_id': '',
	'client_secret': ''
});
// =======================
// routes ================
// =======================
//webhook
app.post('/hook', (req, res) => {
	var payload = JSON.parse(req.body.payload);
	if (payload['pull_request']) {
		var check = [payload["action"], payload['pull_request']['merged'], payload['pull_request']['base']['ref']];
		console.log(check);
		console.log(check[0] == 'closed' && check[1] == true && check[2] == 'prod');
		if (check[0] == 'closed' && check[1] == true && check[2] == 'prod') {
			exec("git pull https://smop-technologies:{PASSWORD-REDACTED}@github.com/AlexShukhman/smopapi.git", (err, stdout, stderr) => {
				if (err) console.error(err);
				console.log(`stdout: ${stdout}`);
				console.log(`stderr: ${stderr}`);
				exec('npm install; pm2 restart api', (err, stdout, stderr) => {
					if (err) console.error(err);
					console.log(`stdout: ${stdout}`);
					console.log(`stderr: ${stderr}`);
				});
			});
		}
	}
	res.json({
		success: true
	});
});
app.post('/newuser', function (req, res) {
	new_user(User, req, res, UserInfo, sendVerificationMail);
});
app.get('/get_user', function (req, res) {
	get_user(User, req, res);
});
app.post('/forgot', (req, res) => {
	console.log('sending forgot email');
	console.log(req.body.email, "forgot their login");
	User.findOne({
		email: req.body.email
	}, (err, usr) => {
		if (err) throw err;
		if (!usr) {
			console.log('no user');
			res.json({
				success: false,
				message: 'no user with this email'
			});
		} else {
			sendForgotMail(req.body.email, usr.id);
			res.json({
				success: true
			});
		}
	});
});
app.get('/checkuser', (req, res) => {
	User.findOne({
		_id: req.headers.id
	}, (err, usr) => {
		if (usr) {
			console.log(usr.name, "is working on remaking their user");
			logintoken = Math.random(10000000);
			usr.token || (usr.token = logintoken);
			usr.save((err, u) => {
				if (err) throw err;
				res.json({
					success: true,
					name: u.name,
					token: u.token
				});
			});
		} else {
			console.log('something shifty afoot...');
			res.json({
				success: false
			});
		}
	});
});
app.post('/remake', (req, res) => {
	User.findOne({
		name: req.body.name,
		token: req.body.token
	}, (err, usr) => {
		if (err) console.log(err);
		if (!usr) {
			console.log(req.body);
			console.log('oh no... no user named', req.body.name);
			res.json({
				success: false,
				message: 'user or token not found'
			});
		} else {
			console.log('success')
			usr.password = req.body.pwd;
			usr.salt = req.body.salt;
			usr.token = ""
			usr.save((err, u) => {
				res.json({
					success: true
				});
			});
		}
	});
});
app.post('/verifyUser', (req, res) => {
	verify_user(User, req, res);
});
app.post('/newuser_test', function (req, res) {
	new_user_test(Testuser, req, res);
});
app.post('/parth_test', (req, res) => {
	parth_test(req,res, spawn, exec, uint8arrayToString);
});
// API ROUTES -------------------
// apiRoutes are routes to helper functions /only/ do not call apiRoutes functions from outside the API
var apiRoutes = express.Router();
apiRoutes.get('/', function (req, res) {
	res.json({
		message: 'Welcome to the smop. API.'
	});
});
// =======================
// authentication ========
// =======================
// authentication script
apiRoutes.post('/authenticate', function (req, res) {
	authenticate(User, req, res, crypto, jwt, app);
});
apiRoutes.post('/authenticate_test', function (req, res) {
	authenticate_test(Testuser, req, res, crypto, jwt, app);
});
apiRoutes.post('/authenticate_admin', (req, res) => {
	authenticate_admin(User, req, res, crypto, jwt, app);
});
// route middleware to verify a token
apiRoutes.use((req, res, next) => {
	token_middleware(req, res, next, jwt, app);
});
apiRoutes.get('/checkToken', function (req, res) {
	console.log('running checkToken');
	res.json({
		success: true
	});
});
// route to parse and check code for standard issues
apiRoutes.post('/post_codeCheck', function (req, res) {
	// console.log(req)
	code_check(req, res, spawn, uint8arrayToString, Task, sendAlert);
});
// route to send notification email
apiRoutes.get('/alert', (req, res) => {
	email_alert(req, res, User, Task, sendAlert);
});
// route to _feed user info
apiRoutes.get('/get_info', function (req, res) {
	get_info(req, res, UserInfo);
});
// Get the Task Feed (Coder and Owner)
apiRoutes.get('/get_feed', (req, res) => {
	get_feed(req, res, Task);
});
app.get('/get_feed', (req, res) => {
	get_feed(req, res, Task);
})
// Get a zip of an AWS
apiRoutes.get('/get_zip', (req, res) => {
	get_zip(req, res, s3, s3Zip, Task);
});
// Create a new task
apiRoutes.post('/post_newtask', function (req, res) {
	new_task(req, res, Task, sendAlert);
});
// Post Pet Code as Owner
apiRoutes.post('/post_petCode', upload.any(), (req, res) => {
	pet_code(req, res, fs, s3, Task);
});
// Get a Single File
apiRoutes.get('/get_file', (req, res) => {
	get_file(req, res, s3, Task);
});
// Get a Single Task
apiRoutes.get('/get_singletask', (req, res) => {
	single_task(req, res, Task, s3);
});
// Decline Task Solution as Owner
apiRoutes.get('/decline_task', (req, res) => {
	decline_task(req, res, Task);
});
// Accept Task Solution as Owner
apiRoutes.get('/accept_user', (req, res) => {
	accept_user(req, res, Task);
});
apiRoutes.get('/get_taskCost', (req, res) => {
	task_cost(req, res, Task);
});
// Get Task Status
apiRoutes.get('/get_taskStatus', (req, res) => {
	task_status(req, res, Task);
});
app.get('/get_taskStatus', (req, res) => {
	task_status(req, res, Task);
});
// Update a Task
apiRoutes.post('/post_updatetask', function (req, res) {
	update_task(req, res, Task);
});
//Pull tasks in CLI readable way
apiRoutes.post('/post_cliPull', function (req, res) {
	cliPull(req, res, Task);
});
/**
 * WEBSOCKET
 */
io.on('connect', (client) => {
	//console.log('request', client);
	console.log('Smop Connected...');
	var id;
	var user;
	var owner;

	client.on('join', (data) => {
		console.log('client joining...')
		data = JSON.parse(data);
		user = data.user;
		id = data.id;
		Task.findOne({
			_id: id
		}, (err, task) => {
			console.log(task);
			owner = task.owner;
			if (err) throw err;
			Chat.find({
				task_id: id
			}, (err, res) => {
				if (err) throw err;
				client.emit('message', JSON.stringify({
					messages: res
				}));
			});
		});
	});

	client.on('message', (data) => {
		Task.findOne({
			_id: id
		}, (err, task) => {
			var m = new Chat({
				task_id: id,
				user: user,
				owner: task.owner,
				value: data
			});
			m.save(((err, message) => {
				if (err) throw err;
				client.send(JSON.stringify({
					message: message
				}));
			}), sendAlert({
				alert: " New Chat from " + user + " on task " + task.name + " with " + data 
			}));
			console.log("email chat notification");
		});
	});
});
app.use('/api', apiRoutes);
app.on('uncaughtException', function (err) {
	console.error(err);
	console.log("api Error, Node NOT Exiting...");
});