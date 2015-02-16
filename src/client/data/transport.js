var EventEmitter = require('events').EventEmitter;

var options = {
    host : 'quickwittedAres.cloud.spudnub.com',
    ssl : false,
    reconnect : false,
    credentials : {
        principal : 'client',
        password : 'client'
    }
};

var log = console.log.bind(console);

function Transport() {
    EventEmitter.call(this);

    var session = null;
    var self = this;

    this.dispatch = function(command, message) {
        session.topics.update(commandTopic, JSON.stringify({ 
            command : message, 
            message : message 
        }));
    };

    this.listen = function(event, message) {
    
    };

    this.init = function() {
        diffusion.connect(options).on('connect', function(sess) {
            session = sess;

            var sessionID = session.sessionID;

            var sessionTopic = 'sessions/' + sessionID;
            var commandTopic = sessionTopic + '/command';

            var initialD = JSON.stringify({
                command : 'READY',
                message : {
                    sessionID : sessionID
                }
            });

            session.topics.removeWithSession(sessionTopic).on('complete', function() {
                session.topics.add(commandTopic).on('complete', function() {
                    self.emit('active');
                }).on('error', log);
            }).on('error', log); 
        });
    };
}

Transport.prototype = new EventEmitter();

module.exports = Transport;
