diffusion.log('debug');

var mcard = new diffusion.metadata.RecordContent();

mcard.addRecord('card', {
        colour : mcard.integer(),
        score : mcard.integer(),
        name : mcard.string()
});

var session = diffusion.connect({
        host : 'quickwittedAres.cloud.spudnub.com',
        ssl : false,
        credentials : {
            principal : 'client',
            password : 'client'
        }
}).on('connect', function(session) {
    var sessionID = session.sessionID;
    var sessionTopic = 'sessions/' + sessionID;

   // Set up identity topic
   session.topics.add(sessionTopic, sessionID).on('complete', function() {
       session.topics.removeWithSession(sessionTopic).on('complete', function() {
            console.log('setup ready');
       });
   });
});


