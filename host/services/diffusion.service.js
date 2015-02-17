var diffusion = require('diffusion');

var events = require('events');
var emitter = new events.EventEmitter();

var session = null;

exports.init = function() {
    var self = this;

    var options = {
        host : 'quickwittedAres.cloud.spudnub.com',
        ssl : false,
        credentials : {
            principal : 'host',
            password : 'ResnapptTheGathering'
        }
    };

    session = diffusion.connect(options);

    session.on('connect', connected);

    this.on = function(evt, callback) {
        emitter.on(evt, callback);
        return self;
    };
    return self;
};

var connected = function() {
    console.log('diffusion connected');
    var subscription = session.subscribe('?sessions/.*')
    .transform(String)
    .on('update', sessionsUpdate)
    .on('unsubscribed', sessionsUnsubscribed);

    session.subscribe('?sessions/.*/command')
    .transform(JSON.parse)
    .on('update', sessionCommand);
};

var sessionsUpdate = function(message, topic) {
    var sessionID = topic.split('sessions/')[1];
    emitter.emit('playerJoined', sessionID);
};

var sessionsUnsubscribed = function(reason, topic) {
    var sessionID = topic.split('sessions/')[1];
    emitter.emit('playerLeft', sessionID);
};

var sessionCommand = function(message, topic) {
    var sessionID = topic.split('/')[1];
    emitter.emit('playerCommand', sessionID, message);
};

var createTopicTree = function() {
    if (session.isConnected()) {
        // add topics that we need here
        var topics = session.topics;

        topics.add('turn').on('complete', function() {
            topics.removeWithSession('turn').on('complete', function() {
                //turn topic ready
            });
        });
    }
};
