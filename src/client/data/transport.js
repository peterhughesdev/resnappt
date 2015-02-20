var EventEmitter = require('events').EventEmitter;

var log = console.log.bind(console);

function Transport(options) {
    EventEmitter.call(this);

    var sessionTopic = null;
    var commandTopic = null;

    var session = null;
    var self = this;


    this.connect = function() {
        diffusion.connect(options).on('connect', function(sess) {
            session = sess;
            
            window.onclose = function() {
                session.close();
            };

            self.sessionID = session.sessionID;
            self.emit('connect');
        }).on('error', function(e) {
            self.emit('error', e);
        }).on('close', function(e) {
            self.emit('close', e);
        });
    };

    this.dispatch = function(command, message) {
        log(command, message);

        session.topics.update(commandTopic, JSON.stringify({ 
            command : command, 
            message : message 
        }));
    };

    this.player = function(topic, type, cb) {
        var t = topic ? sessionTopic + '/' + topic : sessionTopic;
        return this.subscribe(t, type, cb);
    };

    this.subscribe = function(topic, type, cb) {
        var sub = session.subscribe(topic).on('error', log).transform(type);
        
        if (cb) {
            sub.on('update', cb);
        }

        return sub;
    };

    this.unsubscribe = function(topic) {
        return session.unsubscribe(topic);
    };

    this.establishCommandTopic = function(callback) {
        sessionTopic = 'sessions/' + session.sessionID;
        commandTopic = sessionTopic + '/command';


        // Oh dear lord
        session.topics.removeWithSession(sessionTopic).on('complete', function() {
            session.topics.add(sessionTopic).on('complete', function() {
                session.topics.add(sessionTopic + '/command').on('complete', function() {
                    session.topics.add(sessionTopic + '/hand').on('complete', function() {
                        session.topics.add(sessionTopic + '/score', 0).on('complete', callback).on('error', log);
                    }).on('error', log);
                }).on('error', log);
            }).on('error', log);
        }).on('error', log); 
    };
}

Transport.prototype = new EventEmitter();

module.exports = Transport;
