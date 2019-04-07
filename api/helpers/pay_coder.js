var pay_coder = function (req, res, Task, Response, User, paypal, sender_batch_id, payout) {
	var id = req.headers['id']; // task id
	payout(id, Task, Response, User, paypal, sender_batch_id); // mongoose Response
	res.json({
		success: true
		, result: 'all good'
	});
}
module.exports = pay_coder;