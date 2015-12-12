exports.create = function($redisDataAccess) {
    'use strict';

    return new function() {
        var self = this;
        self.create = function(key, value, cb) {
            self.safeRedisCmd(function(client) {
                client.set(key, value, cb);
            });
        };

        self.update = function(key, value, cb) {
            console.log(key)
            console.log(value)
            self.safeRedisCmd(function(client) {
                client.set(key, value, cb);
            });
        };

        self.get = function(key, cb) {
            self.safeRedisCmd(function(client) {
                client.get(key, cb);
            });
        };
    };
};