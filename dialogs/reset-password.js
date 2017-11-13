var builder = require('botbuilder');
var request = require('request');

const library = new builder.Library('resetPassword');
var passwordChangeUrl = "http://gaia:8181/AutomationJobs/webresources/items";
var userNameCheckUrl = 'http://gaia:8181/AutomationJobs/webresources/items/GetUserDetail/';
library.dialog('resetDialog', [
    (session) => {
        builder.Prompts.text(session, 'Please enter your LoginID:', {
            retryPrompt: 'The value you entered is not a valid LoginID. Please try again:',
            maxRetries: 2
        });
    },
    (session, args) => {
        if (args.resumed) {
            session.send('You have tried to enter your LoginID many times. Please try again later.');
            session.endDialogWithResult({resumed: builder.ResumeReason.notCompleted});
            return;
        }

        session.dialogData.loginId = args.response;
        session.sendTyping();
        var requestLoop = setInterval(function () {
            session.sendTyping();
        }, 1000);
        var url = userNameCheckUrl + args.response;

        request.get({
            url: url,
            json: true,
            headers: {'User-Agent': 'request'}
        }, (err, res, data) => {
            if (err) {
                clearInterval(requestLoop);
                session.send("Internal problem Please try again.");
                session.endDialog();
                session.beginDialog("welcomeMSG:choiceSelection");
            } else if (res.statusCode !== 200) {
                clearInterval(requestLoop);
                session.send("Internal problem Please try again.");
                session.endDialogWithResult({resumed: builder.ResumeReason.completed});
                session.beginDialog("welcomeMSG:choiceSelection");

            } else {

                clearInterval(requestLoop);
                if (data.value === '') {
                    session.send('You identity was not verified and your password cannot be reset');
                    session.replaceDialog("resetDialog", args);
                    return;
                }
                session.send("Your Full Name :: " + data.value);
                session.beginDialog("passwordDialog");
            }
        });


    }, (session, args) => {
        if (args.resumed) {
            session.send('You have tried to enter your date of birth many times. Please try again later.');
            session.endDialogWithResult({resumed: builder.ResumeReason.notCompleted});
            return;
        }
        session.dialogData.newpassword = args.response;
        builder.Prompts.text(session, 'Enter Secret Pin : ', {
            retryPrompt: 'The value you entered is not a valid date. Please try again:',
            maxRetries: 2
        });

    }, (session, args) => {
        if (args.resumed) {
            session.send('You have tried to enter your Secret Pin many times. Please try again later.');
            session.endDialogWithResult({resumed: builder.ResumeReason.notCompleted});
            return;
        }

        session.dialogData.secretPin = args.response;
        var jobParamsList = [{"key": "username", "value": session.dialogData.loginId},
            {"key": "password", "value": session.userData.newpassword},
            {"key": "SecretPin", "value": session.dialogData.secretPin}];



        session.sendTyping();
        var requestLoop = setInterval(function () {
            session.sendTyping();
        }, 1000);

        request.post({
            url: passwordChangeUrl,
            json: {"nJobTypeID": 1, "jobName": "", "jobParamsList": jobParamsList},
            headers: {'User-Agent': 'request'}
        }, (err, res, data) => {
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
                session.send("Password reset successfully.");
                session.endDialogWithResult({resumed: builder.ResumeReason.completed});
                session.beginDialog("welcomeMSG:choiceSelection");
            }
        });


    }
]).cancelAction('cancel', null, {matches: /^cancel/i});
library.dialog("passwordDialog", [
    function (session) {
        builder.Prompts.text(session, 'Please enter New Password:', {
            retryPrompt: 'The value you entered value is not correct. Please try again:',
            maxRetries: 2
        });
    }, function (session, args) {
        if (args.resumed) {
            session.send('You have tried to enter your date of birth many times. Please try again later.');
            session.endDialogWithResult({resumed: builder.ResumeReason.notCompleted});
            return;
        }

        session.userData.newpassword = args.response;
        builder.Prompts.text(session, 'Please Re-enter New Password:', {
            retryPrompt: 'The value you entered is not a valid date. Please try again:',
            maxRetries: 2
        });


    }, function (session, args) {
        if (args.resumed) {
            session.send('You have tried to enter your date of birth many times. Please try again later.');
            session.endDialogWithResult({resumed: builder.ResumeReason.notCompleted});
            return;
        }

        session.dialogData.conformPassword = args.response;
        if (session.userData.newpassword !== args.response) {
            session.send("New Password and Re-enter new password not matched");
            session.replaceDialog("passwordDialog");
            return;
        }
        session.endDialog();
    }
]);

module.exports = library;