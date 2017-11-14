var builder = require('botbuilder');
var request = require('request');

const library = new builder.Library('adresetPassword');
var passwordChangeUrl = "http://89.42.169.111:443/AutomationJobs/webresources/items";
var userNameCheckUrl = 'http://89.42.169.111:443/AutomationJobs/webresources/items/GetUserDetail/';
var pinGenerationCheckUrl = 'http://89.42.169.111:443/AutomationJobs/webresources/items/GetPin/';

library.dialog('adresetDialog', [
    (session) => {
        builder.Prompts.text(session, 'Kindly enter your Login ID:', {
            retryPrompt: 'The value you entered is not a valid Login ID. Please try again:',
            maxRetries: 2
        });
    },
    (session, args) => {
        if (args.resumed) {
            session.send('You have tried to enter your Login ID incorrectly many times. Please try again later.');
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
                    session.send('Sorry. Unable to locate your account');
                    session.replaceDialog("resetDialog", args);
                    return;
                }
                session.send("Your Full Name is " + data.value);
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
		
		var url = pinGenerationCheckUrl + session.dialogData.loginId;

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
				session.userData.genPin=data.value;
				session.sendTyping();
				var requestLoop = setInterval(function () {
				session.sendTyping();
				}, 1000);
				session.send("Secret PIN has been successfully shared.");
            }
        });
		
        builder.Prompts.text(session, 'Please enter the Secret PIN which has been shared to your registered  Email ID', {
            retryPrompt: 'The value you entered is not a valid date. Please try again:',
            maxRetries: 2
        });

    }, (session, args) => {
        if (args.resumed) {
            session.send('You have tried to enter your Secret PIN incorrectly many times. Please try again later.');
            session.endDialogWithResult({resumed: builder.ResumeReason.notCompleted});
            return;
        }
        session.dialogData.secretPin = args.response;
		if( session.userData.genPin == args.response ) {
			session.send('Secret PIN has been verified successfully.');
		} else  {
			session.send('Secret PIN verification failed. Please try again.');
			session.endDialogWithResult({resumed: builder.ResumeReason.notCompleted});
            return;
		}
        var jobParamsList = [{"key": "username", "value": session.dialogData.loginId},
            {"key": "password", "value": session.userData.newpassword},
            {"key": "SecretPin", "value": session.dialogData.secretPin}];



        session.sendTyping();
        var requestLoop = setInterval(function () {
            session.sendTyping();
        }, 1000);

        request.post({
            url: passwordChangeUrl,
            json: {"nJobTypeID": 17008, "jobName": "", "jobParamsList": jobParamsList},
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
                session.send("Your password has been reset successfully.");
                session.endDialogWithResult({resumed: builder.ResumeReason.completed});
                session.beginDialog("welcomeMSG:choiceSelection");
            }
        });


    }
]).cancelAction('cancel', null, {matches: /^cancel/i});
library.dialog("passwordDialog", [
    function (session) {
        builder.Prompts.text(session, 'Kindly enter the New Password:', {
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
        builder.Prompts.text(session, 'Kindly confirm the New Password:', {
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
            session.send("New Password and confirmation is not matching");
            session.replaceDialog("passwordDialog");
            return;
        }
        session.endDialog();
    }
]);

module.exports = library;