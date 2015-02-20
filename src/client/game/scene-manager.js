var FSM = require('../util/fsm');

function Container(app) {
    var added = [];
    
    this.add = function(entity) {
        app.renderer.add(entity);
        added.push(entity);
    };

    this.remove = function(entity) {
        app.renderer.remove(entity);
        
        var i = added.indexOf(entity);
        if (i > -1) {
            added.splice(i, 1);
        }
    };

    this.clear = function() {
        added.forEach(app.renderer.remove);
        added = [];
    };
}

function Scene(container, scene) {
    var self = this;

    this.enter = function(done) {
        scene.enter(done);
    };

    this.leave = function(done) {
        scene.leave(function() {
            container.clear();
            done();
        });
    };
}

function SceneManager(app) {
    var fsm = FSM.create('transitioned', {
        'transitioned' : ['transitioning'],
        'transitioning' : ['transitioned']
    });

    var scenes = {};
    var current;

    app.renderer.onTick = function(dt) {
        if (current) {
            current.update(dt);
        }
    }

    function create(name, constructor) {
        if (scenes[name] !== undefined) {
            return;
        }

        var container = new Container(app);
        scenes[name] = new Scene(container, new constructor(app, container));
    };

    this.create = function(pairs) {
        for (var k in pairs) {
            create(k, pairs[k]);
        }
    }

    this.transitionTo = function(name, done) {
        if (scenes[name] && fsm.change('transitioning')) {
            function enter() {
                current = scenes[name];
                current.enter(function() {
                    if (fsm.change('transitioned')) {
                        console.log('Transitioned to scene: ' + name);
                    } else {
                        console.log('Unable to transition to scene: ' + name);
                    }

                    done();
                });
            }

            if (current) {
                current.leave(enter);
            } else {
                enter();
            }
        } else {
            done();
        }
    };
}

SceneManager.create = function(app, scenes) {
    var manager = new SceneManager(app);
    manager.create(scenes);

    return manager;
}

module.exports = SceneManager;
