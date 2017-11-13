var builder = require('botbuilder');
var restify = require('restify');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector, [
    (session) => {

        session.beginDialog('welcomeMSG:WelcomeMSGDialog');
    }, (session, result) => {
        if (result.resume) {
            session.send('You identity was not verified and your password cannot be reset');
            session.reset();
        }
    }
]);

//Sub-Dialogs
bot.library(require('./dialogs/welcomeMsg'));
server.post('/api/messages', connector.listen());


