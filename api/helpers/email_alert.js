var email_alert = function(req, res, User, Task, sendAlert){
    if (req.user){
        User.findOne({
            name: req.user
        }, (err, usr) => {
            if (err) throw err;
            if (!usr) {
                res.json({
                    success: false
                });
            }
            sendAlert({
                alert: req.alert,
                text: req.text
            }, usr.email);
        });
    }
    else {
        sendAlert({
            alert: req.alert,
            text: req.text
        }, req.email); 
        res.json({
            success: true
        });
    }
}
module.exports = email_alert;