exports.create = function ($redisDataAccess, $redisScanner) {
    'use strict';

    return function (args) {
        var self = this;

        var client = $redisDataAccess.createClient();
        var doneCb = function (err) {
            args.done_callback(err);
        };

        
        $redisScanner({
            pattern: args.pattern ? args.pattern : '*',
            redis: client,
            each_callback: function (type, key, subkey, p, value, cb) {
                args.each_callback(type, key, subkey, p, value, function (cancelled) {
                    if (cancelled === true) {
                        doneCb(null);
                    } else {
                        cb();
                    }
                });
            },
            done_callback: doneCb
        });
        return client;
    }
};