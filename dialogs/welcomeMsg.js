var builder = require('botbuilder');
const uuid = require('uuid');
const Support = "Support";
const Enquiry = "Enquiry";
const library = new builder.Library('welcomeMSG');
library.dialog('WelcomeMSGDialog', [
    (session) => {
        builder.Prompts.text(session, 'Hi, Please confirm your identity. \nKindly enter your Login ID', {
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

        builder.Prompts.text(session, 'Enter the Company Name', {
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
        var retryOp = 'Kindly enter your Email ID:';
        if (args && args.isValid === true) {
            retryOp = 'Please provide your Valid Email ID:';
        }
        builder.Prompts.text(session, retryOp, {
            retryPrompt: 'The value you entered is not a valid Email ID. Please try again:',
            maxRetries: 2
        });
    }, function (session, args) {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(args.response)) {
            session.dialogData.email = args.response;
            session.endDialog();
        } else {
            session.replaceDialog("emailDialog", {isValid: true});
        }
    }
]);
library.dialog("phoneNumber", [
    function (session, args) {
        var retOP = 'Enter the Mobile Mobile';
        if (args && args.isValid) {
            retOP = 'Enter the valid Mobile Number';
        }
        builder.Prompts.number(session, retOP, {
            retryPrompt: 'The value you entered is not a valid Mobile Number. Please try again',
            maxRetries: 2
        });
    }, function (session, result) {
        if (/^\d{10}$/.test(result.response)) {
            session.dialogData.mobileNumber = result.response;
            session.endDialog();
        } else {
            session.replaceDialog("phoneNumber", {isValid: true});

        }
    }
]);
library.dialog("choiceSelection",[
    function(session){
         builder.Prompts.choice(session,
                'Kindly let me know, what I may help you with?',
                [Support, Enquiry],
                {listStyle: builder.ListStyle.button});
    },function (session, result) {
        if (result.response) {
            switch (result.response.entity) {
                case Support:
                    session.beginDialog('actionSelection:/');
                    break;
                case Enquiry:
                    session.send('This functionality is not yet implemented! ');
                    //session.endDialogWithResult({resumed: builder.ResumeReason.completed});
                    session.replaceDialog("choiceSelection",result);
                    break;

            }
        } else {
            session.send(`I am sorry but I didn't understand that. I need you to select one of the options below`);
            
        }
    }
]);
library.library(require('./choosePaswordOptions'));
library.library(require('./actionsSelection'));
module.exports = library;