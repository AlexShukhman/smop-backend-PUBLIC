var payout = function (id, Task, Response, User, paypal, sender_batch_id) {
	Task.findOne({
		_id: id
	}, (err, task) => {
		Response.findOne({
			task_id: id
			, accepted: true
		}, (err, response) => {
			User.findOne({
				name: response.coder // stored as the name of the coder
			}, (err, user) => {
				var create_payout_json = {
					"sender_batch_header": {
						"sender_batch_id": sender_batch_id
						, "email_subject": "New Payment from Smop!"
					}
					, "items": [
						{
							"recipient_type": "EMAIL"
							, "amount": {
								"value": task.bounty
								, "currency": "USD"
							}
							, "receiver": user.email
							, "note": "Congrats on finishing the task!"
							, "sender_item_id": "item1"
						}
					]
				}
				paypal.payout.create(create_payout_json, (err, payout) => {
					if (err) throw err;
					else {
						response.cashed = true;
						response.save((err, res) => {
							if (err) throw err;
						});
					}
				});
			});
		});
	});
}
module.exports = payout;