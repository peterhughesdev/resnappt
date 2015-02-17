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

    var sessionTopic = null;
    var commandTopic = null;

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

    this.subscribe = function(topic) {
        return session.subscribe(sessionTopic + '/' + topic).on('error', log);
    };

    this.unsubscribe = function(topic) {
        return session.unsubscribe(sessionTopic + '/' + topic);
    };

    this.init = function() {
        diffusion.connect(options).on('connect', function(sess) {
            session = sess;

            var sessionID = session.sessionID;

            sessionTopic = 'sessions/' + sessionID;
            commandTopic = sessionTopic + '/command';

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
