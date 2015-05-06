exports.create = function ($redisDataAccess) {
    'use strict';

    return new function() {
        var self = this;
        self.create = function(key, value, cb) {
            $redisDataAccess.createClient().set(key, value, cb);
        };

        self.update = function (keyData, newValue) {
            $redisDataAccess.createClient().set(keyData.Key, newValue);
        };

        self.delete = function (keyData) {
            $redisDataAccess.createClient().del(keyData.Key);
        };
    };
};