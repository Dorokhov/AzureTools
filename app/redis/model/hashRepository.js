exports.create = function ($redisDataAccess) {
    'use strict';

    return new function () {
        var self = this;
        self.create = function (key, value, cb) {
            var members = self.Utils.safeJsonParse(value);
            for (var i = 0; i < members.length; i++) {
                self.safeRedisCmd(function (client) {
                    client.hset(key, members[i][0], members[i][1], cb);
                });
            }
        };

        self.update = function (keyData, cb) {
            self.Utils.safeJsonParse(keyData.Value);
            // TODO: Transaction here
            self.safeRedisCmd(function (client) {
                client.del(keyData.Key);
            });
            self.create(keyData.Key, keyData.Value, cb);
        };
    };
};