exports.create = function ($redisDataAccess) {
    'use strict';

    return new function () {
        var self = this;
        self.create = function (key, value, cb) {
            var members = self.Utils.safeJsonParse(value);
            for (var i = 0; i < members.length; i++) {
                $redisDataAccess.createClient().hset(key, members[i][0], members[i][1], cb);
            }
        };

        self.update = function (keyData, newValue, cb) {
            self.Utils.safeJsonParse(newValue);
            $redisDataAccess.createClient().del(keyData.Key);
            self.create(keyData.Key, newValue, cb);
        };
    };
};