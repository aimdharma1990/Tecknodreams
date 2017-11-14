var builder = require('botbuilder');
var request = require('request');
var incidentUrl = "http://89.42.169.111:443/AutomationJobs/webresources/items";
var userNameCheckUrl = 'http://89.42.169.111:443/AutomationJobs/webresources/items/GetUserDetail/';
const library = new builder.Library('raiseAnIncident');
library.dialog("raiseAnIncidentDialog", [
    function (session) {
        session.beginDialog("userNameDialog");
    }
]).cancelAction('cancel', null, {matches: /^cancel/i});
library.dialog("userNameDialog", [
    function (session) {
        builder.Prompts.text(session, 'Kindly enter your Login ID', {
            retryPrompt: '',
            maxRetries: 2
        });
    }, function (session, args) {
        session.userData.ticketUserId = args.response;
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
                    session.replaceDialog("userNameDialog", args);
                    return;
                }
                builder.Prompts.text(session, 'Enter Incident Description', {
                    retryPrompt: '',
                    maxRetries: 2
                });
            }
        });
    }, function (session, args) {
        session.userData.incidentDescription = args.response;
        var jobParamsList = [{"key": "Description", "value": session.userData.incidentDescription},
            {"key": "userName", "value": session.userData.ticketUserId}];
        session.sendTyping();
        var requestLoop = setInterval(function () {
            session.sendTyping();
        }, 1000);
        request.post({
            url: incidentUrl,
            json: {"nJobTypeID": 4, "jobName": "Ticket", "jobParamsList": jobParamsList},
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
                session.send("Incident submitted successfully");
                session.endDialogWithResult({resumed: builder.ResumeReason.completed});
                session.beginDialog("welcomeMSG:choiceSelection");
            }
        });
    }
]);
module.exports = library;
