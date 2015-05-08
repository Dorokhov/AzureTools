exports.create = function ($redisDataAccess, $utils) {
    'use strict';

    return new function () {
        var self = this;
        self.Utils = $utils;
        self.delete = function (keyData) {
            $redisDataAccess.createClient().del(keyData.Key);
        };
    };
};