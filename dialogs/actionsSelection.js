var builder = require('botbuilder');

const library = new builder.Library('actionSelection');
const PasswordReset = "Password Reset";
const ShareFolder = "Share Folder";
const uuid = require('uuid');
library.dialog('/', [
    (session) => {
        builder.Prompts.choice(session,
                'Please select a support category?',
                [PasswordReset, ShareFolder],
                {listStyle: builder.ListStyle.button});
    }, (session, result) => {

        if (result.response) {
            switch (result.response.entity) {
                case PasswordReset:
                    session.beginDialog('PasswordOptions:PasswordOptionsDialog');
                    break;
                case ShareFolder:
                    session.beginDialog('ShareFolder:ShareFolderDialog');
                    break;
                default :
                    session.send(`I am sorry but I didn't understand that. I need you to select one of the options below`);
                    break;

            }
        } else {
            session.send(`I am sorry but I didn't understand that. I need you to select one of the options below`);
        }
    }
]).cancelAction('cancel', null, {matches: /^cancel/i});
library.library(require('./choosePaswordOptions'));
library.library(require('./shareFolder'));
module.exports = library;