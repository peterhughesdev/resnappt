function ServiceManager(app) {
    var servicesForEvents = {};
    var servicesForTick = [];

    var ctx = {};
    
    this.add = function(service) {
        if (service.events) {
            service.events.forEach(function(e) {
                if (servicesForEvents[e] === undefined) {
                    servicesForEvents[e] = [];
                }

                servicesForEvents[e].push(service.handler);
            });
        } else {
            servicesForTick.push(service.handler);
        }
    };

    this.onTick = function(dt) {
        servicesForTick.forEach(function(service) {
            service(app, ctx, dt);
        }); 
    };

    this.onEvent = function(e, data) {
        if (servicesForEvents[e]) {
            servicesForEvents[e].forEach(function(service) {
                service(e, app, ctx, data);
            });
        }
    };
}

ServiceManager.create = function(app, services) {
    var manager = new ServiceManager(app);
    services.forEach(manager.add);

    return manager;
};

module.exports = ServiceManager;
