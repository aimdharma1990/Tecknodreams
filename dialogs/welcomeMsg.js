var builder = require('botbuilder');
const uuid = require('uuid');
const Support = "Support";
const Enquiry = "Enquiry";
const RaiseAnIncident = "Raise An Incident";
const library = new builder.Library('welcomeMSG');
library.dialog('WelcomeMSGDialog', [
    (session) => {
        builder.Prompts.text(session, 'Hi, Please confirm your identity. \n Kindly enter your Login ID', {
            retryPrompt: 'The value you entered is not a valid Name. Please try again:',
            maxRetries: 2
        });
    },
    (session, args) => {
        if (args.resumed) {
            session.send('You have tried to enter your Name incorrectly many times. Please try again later.');
            session.endDialogWithResult({resumed: builder.ResumeReason.notCompleted});
            return;
        }

        session.userData.name = args.response;
        session.beginDialog("emailDialog");
    },
    (session, args) => {
        if (args.resumed) {
            session.send('You have tried to enter your Email ID incorrectly many times. Please try again later.');
            session.endDialogWithResult({resumed: builder.ResumeReason.notCompleted});
            return;
        }

        //session.send('The date of birth you provided is: ' + args.response.entity);
        session.userData.email = args.response;

        builder.Prompts.text(session, 'Enter your Company Name', {
            retryPrompt: 'The value you entered is not a valid Company Name. Please try again',
            maxRetries: 2
        });
    }, (session, args) => {
        if (args.resumed) {
            session.send('You have tried to enter your Company Name incorrectly many times. Please try again later.');
            session.endDialogWithResult({resumed: builder.ResumeReason.notCompleted});
            return;
        }
        session.userData.company = args.response;
        session.beginDialog("phoneNumber");


    }, (session, args) => {
        if (args.resumed) {
            session.send('You have tried to enter your Mobile Number incorrectly many times. Please try again later.');
            session.endDialogWithResult({resumed: builder.ResumeReason.notCompleted});
            return;
        }
        session.userData.mobileNumber = args.response;
        session.beginDialog("choiceSelection");
    }
]).cancelAction('cancel', null, {matches: /^cancel/i});

library.dialog("emailDialog", [
    function (session, args) {
        var retryOp = 'Enter your Email ID';
        if (args && args.isValid === true) {
            retryOp = 'Please provide a valid Email ID';
        }
        builder.Prompts.text(session, retryOp, {
            retryPrompt: 'The value you entered is not a valid Email ID. Please try again..',
            maxRetries: 2
        });
    }, function (session, args) {
        session.dialogData.email = args.response;
        session.endDialog();

    }
]);
library.dialog("phoneNumber", [
    function (session, args) {
        var retOP = 'Enter your Mobile Number';
        if (args && args.isValid) {
            retOP = 'Incorrect Mobile Number. Please enter a valid Mobile Number';
        }
        builder.Prompts.text(session, retOP, {
            retryPrompt: 'The value you entered is not a valid Mobile Number. Please try again',
            maxRetries: 2
        });
    }, function (session, result) {
        var tempPhone = result.response;
        if (tempPhone.length <= 9) {
            session.replaceDialog("phoneNumber", {isValid: true});
        } else if (!tempPhone.startsWith("+9715") && !tempPhone.startsWith("05")) {
            session.replaceDialog("phoneNumber", {isValid: true});
        } else {
            tempPhone = tempPhone.replace("+", "");
            if (isNaN(tempPhone)) {
                session.replaceDialog("phoneNumber", {isValid: true});
            } else {
                session.dialogData.mobileNumber = result.response;
                session.endDialog();
            }
        }

    }
]);
library.dialog("choiceSelection", [
    function (session) {
        builder.Prompts.choice(session,
                'Kindly let me know, what I may help you with?',
                [Support, Enquiry, RaiseAnIncident],
                {listStyle: builder.ListStyle.button});
    }, function (session, result) {
        if (result.response) {
            switch (result.response.entity) {
                case Support:
                    session.beginDialog('actionSelection:/');
                    break;
                case Enquiry:
                    session.beginDialog('enquirySelection:enquiryDialog');
                    break;
                case RaiseAnIncident:
                   session.beginDialog('raiseAnIncident:raiseAnIncidentDialog');
                    break;

            }
        } else {
            session.send(`I am sorry but I didn't understand that. I need you to select one of the options below`);

        }
    }
]);
library.library(require('./choosePaswordOptions'));
library.library(require('./actionsSelection'));
library.library(require('./enquiry'));
library.library(require('./raiseAnIncident'));
module.exports = library;