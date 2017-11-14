var builder = require('botbuilder');
var restify = require('restify');

// Setup Restify Server
var server_port =  process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.IP  || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'

var server = restify.createServer(); 
server.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", port " + server_port )
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector, [
    (session) => {
        session.send("Welcome to the Alpha Interactive");
        session.beginDialog('welcomeMSG:WelcomeMSGDialog');
    }, (session, result) => {
        if (result.resume) {
            session.send('Unable to locate your account');
            session.reset();
        }
    }
]);

//Sub-Dialogs
bot.library(require('./dialogs/welcomeMsg'));
server.post('/', connector.listen());


