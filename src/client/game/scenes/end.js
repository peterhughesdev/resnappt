var Text = require('../entities/text');

function EndScene(app, container) {
    var endingText = Text(1024, 400, 'Game ove!', 64, 'white');
   
    var scoreSub;

    this.enter = function(done) {
        container.add(endingText);
        
        scoreSub = app.transport.subscribe('summary', JSON.parse).on('update', displaySummary);

        done();
    };

    this.leave = function(done) {
        done();
    };

    function displaySummary(results) {
        var highest = results.sort(byScore)[0];
        
        results.forEach(function(result, i) {
            var resY = 650 + (80 * i);
            var colour = result === highest ? '#FFD633' : 
                         (result.playerID  === app.transport.sessionID ? '#8CE8FF' : 'white');
                    
            var resText = Text(1024, resY, 'Player ' + i + ' -- ' + result.score, 50, colour);
            container.add(resText);
        });
    }

    function byScore(r1, r2) {
        return r1.score < r2.score ? 1 : -1;
    }
}

module.exports = EndScene;
