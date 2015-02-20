var states = {
    'turn' : { prev : 'nextturn', next : 'endturn' },
    'endturn' : { prev : 'turn', next : 'snap' },
    'snap' : { prev : 'endturn', next : 'nextturn' },
    'nextturn' : { prev : 'snap', next : 'turn' },
    'endGame' : { next : '' }
};



function State() {
    var current = 'turn';

    var invalid = function(next) {
        console.error('Invalid transition from '+current+' to '+next);
    };

    var transition = function(now) {
        if (current === now) {
            current = states[current].next;
        } else {
            invalid(states[now].next);
        }
    };

    this.endTurn = function() {
        transition('turn');
    };

    this.startSnap = function() {
        transition('endturn');
    };

    this.endSnap = function() {
        transition('snap');
    };

    this.nextTurn = function() {
        transition('nextturn');
    };

    this.endGame = function() {
        console.log('Ending game');
        current = 'endgame';
    }

    this.isPlaying = function() {
        return current === 'turn';
    };
    this.turnEnded = function() {
        return current === 'endturn';
    };
    this.isSnapPhase = function() {
        return current === 'snap';
    };
    this.isNextTurn = function() {
        return current === 'nextturn';
    };
    this.isGameEnded = function() {
        return current === 'endgame';
    };
};

module.exports = State;
