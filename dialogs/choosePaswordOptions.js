var builder = require('botbuilder');
const SapphirePassword = "SapphireIMS";
const ADPassword = "Active Directory";
const library = new builder.Library('PasswordOptions');
library.dialog('PasswordOptionsDialog', [
    function (session){
        builder.Prompts.choice(session,
                'Kindly select the application, for which the password needs to be reset?',
                [SapphirePassword, ADPassword],
                {listStyle: builder.ListStyle.button});
    },function(session,result){
        if (result.response) {
            switch (result.response.entity) {
                case SapphirePassword:
                    session.beginDialog('resetPassword:resetDialog');
                    break;
                case ADPassword:
                    session.beginDialog('adresetPassword:adresetDialog');
                    break;
                default :
                    session.send(`I am sorry but I didn't understand that. Kindly select one of the options given below`);
                    break;

            }
        } else {
            session.send(`I am sorry but I didn't understand that. Kindly select one of the options given below`);
        }
    }
]);
library.library(require('./reset-password'));
library.library(require('./adreset-password'));
module.exports = library;