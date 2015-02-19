var diffusion = require('diffusion');

var events = require('events');
var emitter = new events.EventEmitter();

var session = null;

exports.init = function() {
    var self = this;

    this.on = function(evt, callback) {
        emitter.on(evt, callback);
        return self;
    };
    return self;
};

exports.start = function() {
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
};

exports.cleanup = function() {
    session.close();
};

var connected = function() {
    console.log('diffusion connected', session.isConnected());
    var subscription = session.subscribe('?sessions/.*')
    .on('subscribed', sessionsAdded)
    .on('unsubscribed', sessionsUnsubscribed);

    session.subscribe('?sessions/.*/command')
    .transform(JSON.parse)
    .on('update', sessionCommand);

    createTopicTree();
};

var sessionsAdded = function(message, topic) {
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
                console.log('added turn topic');
            });
        });
        topics.add('deck').on('complete', function() {
            topics.removeWithSession('deck').on('complete', function() {
                console.log('added deck topic');
            });
        });
        topics.add('pile/score');
        topics.add('pile/effects');
        topics.add('summary');
        topics.add('snap/winner');
        topics.add('snap/timer');
    }
};

exports.publishSnapper = function(playerID) {
    publish('snap/winner', playerID);
};

exports.snapTimer = function(snap) {
    publish('snap/timer', snap);
};

exports.scoreSummary = function(scores) {
    publish('summary', JSON.stringify(scores));
};

exports.drawCard = function(player) {
    publish('sessions/'+player.playerID+'/hand', JSON.stringify(player.getHand()));
};

exports.updateDeck = function(remaining) {
    publish('deck', remaining);
};

exports.nextTurn = function(playerID) {
    publish('turn', playerID);
};

exports.topOfPile = function(card) {
    console.log(card);
    publish('pile/score', JSON.stringify(card.toData()));
};

exports.updateEffectsPile = function(effects) {
    var toPublish = [];
    for (var i in effects) {
        toPublish[toPublish.length] = effects[i].toData();
    }
    publish('pile/effects', JSON.stringify(toPublish));
};

exports.updateScore = function(player) {
    publish('sessions/'+player.playerID+'/score', player.getScore());
};

var publish = function(topic, data) {
    session.topics.update(topic, data);
    console.log('publishing '+topic+' with '+data);
};
