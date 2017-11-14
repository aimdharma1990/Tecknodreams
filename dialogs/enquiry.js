var builder = require('botbuilder');
var request = require('request');
var enquiryUrl = "http://localhost:8888/AutomationJobs/webresources/items";
const library = new builder.Library('enquirySelection');
library.dialog("enquiryDialog", [
    function (session) {
        builder.Prompts.text(session, 'Enter your Name', {
            retryPrompt: '',
            maxRetries: 2
        });
    }, function (session, args) {
        session.userData.Name = args.response;
        builder.Prompts.text(session, 'Enter your Designation', {
            retryPrompt: '',
            maxRetries: 2
        });
    }, function (session, args) {
        session.userData.Designation = args.response;
        builder.Prompts.text(session, 'Enter your Email ID', {
            retryPrompt: '',
            maxRetries: 2
        });
    }, function (session, args) {
        session.userData.enquiryEmail = args.response;
        builder.Prompts.text(session, 'Enter Products of Interest', {
            retryPrompt: '',
            maxRetries: 2
        });
    }, function (session, args) {
        session.userData.productsOfInterest = args.response;
        var jobParamsList = [{"key": "Name", "value": session.userData.Name},
            {"key": "Designation", "value": session.userData.Designation},
            {"key": "Email ID", "value": session.userData.enquiryEmail},
            {"key": "Products of Interest", "value": session.userData.productsOfInterest}];

        session.sendTyping();
        var requestLoop = setInterval(function () {
            session.sendTyping();
        }, 1000);
        request.post({
            url: enquiryUrl,
            json: {"nJobTypeID": 3, "jobName": "Enquery", "jobParamsList": jobParamsList},
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
                session.send("Your enquiry recorded");
                session.endDialogWithResult({resumed: builder.ResumeReason.completed});
                session.beginDialog("welcomeMSG:choiceSelection");
            }
        });

    }
]).cancelAction('cancel', null, {matches: /^cancel/i});
module.exports = library;

