exports.create = function ($redisDataAccess, $redisScanner) {
    'use strict';

    return function (args) {
        var client = $redisDataAccess.createClient();
        $redisScanner({
            pattern: args.pattern ? args.pattern : '*',
            redis: client,
            each_callback: args.each_callback,
            done_callback: function (err) {
                client.quit();
                args.done_callback(err);
            }
        });
        return client;
    }
};