exports.create = function($redisDataAccess) {
    'use strict';

    return new function() {
        var self = this;
        self.create = function(key, value, cb) {
            var members = self.Utils.safeJsonParse(value);
            for (var i = 0; i < members.length; i++) {
                self.safeRedisCmd(function(client) {
                    client.hset(key, members[i][0], members[i][1], cb);
                });
            }
        };

        self.hset = function(key, name, value, cb) {
            self.safeRedisCmd(function(client) {
                console.log(key)
                console.log(name)
                console.log(value)
                client.hset(key, name, value, cb);
            });
        };

        self.replaceMember = function(key, oldName, name, value, cb) {
            self.safeRedisCmd(function(client) {
                console.log(key)
                console.log(name)
                console.log(value)
                client.multi()
                    .hset(key, name, value)
                    .hdel(key, oldName)
                    .exec(function(err, replies) {
                        cb();
                    });
            });
        };

        self.get = function(key, cb) {
            self.safeRedisCmd(function(client) {
                client.hgetall(key, cb);
            });
        };
    };
};