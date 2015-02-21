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

    session.on('connect', connected)
    .on('close', sessionClosed)
    .on('disconnect', sessionDisconnected)
    .on('error', sessionError);
};

exports.cleanup = function() {
    session.close();
};

var connected = function() {
    console.log('diffusion connected', session.isConnected());
    var subscription = session.subscribe('?sessions/.*')
    .on('subscribed', playerAdded)
    .on('unsubscribed', playerUnsubscribed);

    session.subscribe('?sessions/.*/command')
    .on('update', playerCommand);

    createTopicTree();
};

var sessionClosed = function(reason) {
    console.log('Diffusion session closed');
    console.log(reason);
};

var sessionDisconnected = function() {
    console.log('Diffusion session disconnected');
};

var sessionError = function(err) {
    console.log('Diffusion session error');
    console.log(err);
};

var playerAdded = function(message, topic) {
    var sessionID = topic.split('sessions/')[1];
    emitter.emit('playerJoined', sessionID);
};

var playerUnsubscribed = function(reason, topic) {
    var sessionID = topic.split('sessions/')[1];
    emitter.emit('playerLeft', sessionID);
};

var playerCommand = function(message, topic) {
    if (message.length) {
        message = JSON.parse(message);
        var sessionID = topic.split('/')[1];
        emitter.emit('playerCommand', sessionID, message);
    }
};

var createTopicTree = function() {
    if (session.isConnected()) {
        // add topics that we need here
        var topics = session.topics;

        topics.add('turn', '{}').on('complete', function() {
            topics.removeWithSession('turn').on('complete', function() {
                console.log('added turn topic');
            });
        });
        topics.add('deck', '{}').on('complete', function() {
            topics.removeWithSession('deck').on('complete', function() {
                console.log('added deck topic');
            });
        });
        topics.add('pile/score', '{}');
        topics.add('pile/effects', '[]');
        topics.add('summary', '{}');
        topics.add('snap/winner', '{}');
        topics.add('snap/timer', '{}');
        topics.add('state', '{}').on('complete', function() {
            publish('state', JSON.stringify({state:'NOT_PLAYING'}));
        });
    }
};

exports.startGame = function(players) {
    var message = { state : 'PLAYING', players : players };
    publish('state', JSON.stringify(message));
};

exports.endGame = function() {
    var message = { state : 'NOT_PLAYING' };
    publish('state', JSON.stringify(message));
};

exports.registerPlayer = function(playerID, turn) {
    publish('sessions/'+playerID, JSON.stringify({type : 'PLAYER', turn:turn}));
};

exports.registerSpectator = function(playerID) {
    publish('sessions/'+playerID, JSON.stringify({type : 'SPECTATOR'}));
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
    console.log(topic + ' >> ' + data);
    session.topics.update(topic, data);
};
