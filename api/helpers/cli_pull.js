var cliPull = function (req, res, Task) {
    var flag = req.headers.flag;
    var taskOrlang = req.headers.taskorlang;
    console.log(req.headers)
    if (flag === 'none') {
        var message = 'use -a for all active tasks, -l <languages> for certain languages, or -t <taskID> for a specific task';
        res.json({message: message});
    } else if (flag === 'a') {
        // all tasks
        // console.log('getting all active tasks')
        Task.find({
            accepted: true
        }).then((result) => {
            var message = "Here are all the current active tasks!\n";
            for (var i = 0; i < result.length; i++) {
                message += "\t " + (i + 1) + ") " + result[i].name + " posted by " + result[i].owner + ", taskId: " + result[i]._id + "\n" 
            }
            message += "Pull a specific taskID to get more information!"
            res.json({message: message});
        }).catch((err) => {
            // console.log('no tasks found!');
            console.log(err)
            var message = 'no tasks found!';
            res.json({message: message})
        });
    } else if (flag === 'l') {
        //language case
        // console.log('getting languages ' + taskOrlang)
        taskOrlang = taskOrlang.split(',')
        taskOrlang.push('')
        // console.log(taskOrlang)
        Task.find({
            accepted: true,
            lang: taskOrlang
        }).then((result) => {
            var message = "Here are all the tasks that require only: " + taskOrlang.slice(0,taskOrlang.length - 1) + "!\n";
            for (var i = 0; i < result.length; i++) {
                message += "\t " + (i + 1) + ") " + result[i].name + " posted by " + result[i].owner + ", taskId: " + result[i]._id + "\n" 
            }
            message += "If you want a wider range of tasks, try using smop pull -a!"
            res.json({message: message})
        }).catch((err) => {
            console.log('oops something went wrong, try again!')
            var message = 'oops something went wrong, try again!'
            res.json({message: message})
        })
    } else {
        //task case
        // console.log('getting task ' + taskOrlang)
        Task.findOne({
            _id: taskOrlang
        }).then((result) => {
            // console.log(result)
            var message = "Task Name: " + result.name + "\nPosted by: " + result.owner + "\nLanguages: " + result.lang.slice(0, result.lang.length - 1) + "\nTask Description: " + result.task.message_long
            res.json({message: message})
        }).catch((err) => {
            console.log('oops something went wrong, try again!');
            var message = 'oops something went wrong, try again!'
            res.json({message: message})
        });
    }
}
module.exports = cliPull;