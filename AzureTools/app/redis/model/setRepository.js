exports.create = function ($redisDataAccess) {
    'use strict';

    return new function () {
        var self = this;

        self.create = function (key, value, cb) {
            var members = self.Utils.safeJsonParse(value);
            if (members != null) {
                self.safeRedisCmd(function (client) {
                    client.sadd(key, members, cb);
                });
            }
        };

        self.update = function (keyData, newValue) {
            var updatedMembers = self.Utils.safeJsonParse(newValue);
            if (updatedMembers != null) {
                // TODO: Replace with transaction
                self.safeRedisCmd(function (client) {
                    client.del(keyData.Key);
                    client.sadd(keyData.Key, updatedMembers);
                });
            }
        };
    };
};