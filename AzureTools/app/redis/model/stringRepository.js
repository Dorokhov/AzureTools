exports.create = function ($redisDataAccess) {
    'use strict';

    return new function () {
        var self = this;
        self.create = function (key, value, cb) {
            self.safeRedisCmd(function (client) {
                client.set(key, value, cb);
            });
        };

        self.update = function (keyData, newValue, cb) {
            self.safeRedisCmd(function (client) {
                client.set(keyData.Key, newValue, cb);
            });
        };
    };
};