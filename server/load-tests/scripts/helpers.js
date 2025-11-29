// Helper functions for Artillery load tests

module.exports = {
    // Generate random string for unique usernames
    generateRandomString: function (context, events, done) {
        context.vars.randomString = Math.random().toString(36).substring(7);
        return done();
    },

    // Generate timestamp
    generateTimestamp: function (context, events, done) {
        context.vars.timestamp = Date.now();
        return done();
    },

    // Log response for debugging
    logResponse: function (requestParams, response, context, ee, next) {
        console.log('Response status:', response.statusCode);
        if (response.statusCode >= 400) {
            console.log('Error response:', response.body);
        }
        return next();
    },

    // Custom metrics
    recordCustomMetric: function (context, events, done) {
        events.emit('counter', 'custom.requests', 1);
        return done();
    }
};
