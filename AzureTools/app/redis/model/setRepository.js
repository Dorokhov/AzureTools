exports.create = function ($redisDataAccess) {
    'use strict';

    return new function() {
        var self = this;
        self.create = function (key, value, cb) {
            var members = JSON.parse(value);
            $redisDataAccess.createClient().sadd(key, members, cb);
        };

        self.update = function (keyData, newValue) {
            var updatedMembers = JSON.parse(newValue);
            $redisDataAccess.createClient().del(keyData.Key);
            $redisDataAccess.createClient().sadd(keyData.Key, updatedMembers);
        };

        self.delete = function (keyData) {
            $redisDataAccess.createClient().del(keyData.Key);
        };
    };
};