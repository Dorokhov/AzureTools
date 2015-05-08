exports.create = function ($redisDataAccess) {
    'use strict';

    return new function () {
        var self = this;
        
        self.create = function (key, value, cb) {
            var members = self.Utils.safeJsonParse(value);
            if (members != null) {
                $redisDataAccess.createClient().sadd(key, members, cb);
            }
        };

        self.update = function (keyData, newValue) {
            var updatedMembers = self.Utils.safeJsonParse(newValue);
            if (updatedMembers != null) {
                $redisDataAccess.createClient().del(keyData.Key);
                $redisDataAccess.createClient().sadd(keyData.Key, updatedMembers);
            }
        };
    };
};