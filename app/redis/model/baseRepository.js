exports.create = function ($redisDataAccess, $utils) {
    'use strict';

    return new function () {
        var self = this;
        self.Utils = $utils;
        self.safeRedisCmd = function (cb) {
            var client = $redisDataAccess.createClient();
            try {
                cb(client);
            } finally {
            }
        };
        self.delete = function (keyData) {
            self.safeRedisCmd(function (client) {
                client.del(keyData.Key);
            });
        };
    };
};