var builder = require('botbuilder');
var request = require('request');

const library = new builder.Library('ShareFolder');
var SahreFolderUrl = "http://gaia:8181/AutomationJobs/webresources/items";

library.dialog("ShareFolderDialog", [
    function (session) {
        session.beginDialog("ShareIpAddress");
    }, function (session, result) {
      //  session.dialogData.ipAddress = result.response;
        builder.Prompts.text(session, "Enter Path Name", {
            retryPrompt: 'The value you entered is not a valid Path Name. Please try again:',
            maxRetries: 2
        });
    }, function (session, result) {
        if (result.resumed) {
            session.send('You have tried to enter path name many times. Please try again later.');
            session.endDialogWithResult({resumed: builder.ResumeReason.notCompleted});
            return;
        }
        session.dialogData.pathName = result.response;
        builder.Prompts.text(session, "Enter Share Name", {
            retryPrompt: 'The value you entered is not a valid Share. Please try again:',
            maxRetries: 2
        });
    }, function (session, result) {
        if (result.resumed) {
            session.send('You have tried to enter share name many times. Please try again later.');
            session.endDialogWithResult({resumed: builder.ResumeReason.notCompleted});
            return;
        }
        session.dialogData.shareName = result.response;
        builder.Prompts.text(session, "Enter Description", {
            retryPrompt: 'The value you entered is not a valid description. Please try again:',
            maxRetries: 2
        });
    }, function (session, result) {
        if (result.resumed) {
            session.send('You have tried to enter description many times. Please try again later.');
            session.endDialogWithResult({resumed: builder.ResumeReason.notCompleted});
            return;
        }
        session.dialogData.description = result.response;

        builder.Prompts.number(session, "Enter Max Users", {
            retryPrompt: 'Please Enter valid Max Users',
            maxRetries: 2
        });
    }, function (session, result) {
        if (result.resumed) {
            session.send('You have tried to enter max users many times. Please try again later.');
            session.endDialogWithResult({resumed: builder.ResumeReason.notCompleted});
            return;
        }
        session.dialogData.maxUsers = result.response;

        var jobParamsList = [{"key": "5", "value": session.dialogData.pathName},
            {"key": "6", "value": session.dialogData.shareName},
            {"key": "7", "value": session.dialogData.description},
            {"key": "8", "value": session.dialogData.maxUsers}];


        session.sendTyping();
        var requestLoop = setInterval(function () {
            session.sendTyping();
        }, 1000);

        request.post({
            url: SahreFolderUrl,
            json: {"nJobTypeID": 10003, "jobName": session.dialogData.description,
                "jobParamsList": jobParamsList, "systemIDList": [session.userData.ipAddress]},
            headers: {'User-Agent': 'request'}
        }, function (err, res, data) {
            if (err) {
                clearInterval(requestLoop);
                session.send("Internal problem Please try again.");
                session.endDialog();
                session.beginDialog("welcomeMSG:choiceSelection");
            } else if (res.statusCode !== 200) {
                clearInterval(requestLoop);
                session.send("Internal problem Please try again.");
                session.endDialog();
                session.beginDialog("welcomeMSG:choiceSelection");
            } else {
                clearInterval(requestLoop);
                session.send("Share folder job posted successfully");
                session.endDialog();
                session.beginDialog("welcomeMSG:choiceSelection");
            }
        });
    }
]).cancelAction('cancel', null, {matches: /^cancel/i});

library.dialog("ShareIpAddress", [
    function (session, args) {
        var rest = "Please Enter System IP Address";
        if (args && args.isValid === true) {
            rest = "Please Enter valid System IP Address";
        }
        builder.Prompts.text(session, rest, {
            retryPrompt: 'The value you entered is not a valid IP Address. Please try again:',
            maxRetries: 2
        });
    }, function (session, args) {
        if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(args.response))
        {
            session.userData.ipAddress = args.response;
            session.endDialog();
        } else {
            session.replaceDialog("ShareIpAddress", {isValid: true});
        }
    }
]);

module.exports = library;