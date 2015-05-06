exports.create = function ($redisDataAccess, $redisScanner) {
    'use strict';

    return function (args) {
        $redisScanner({
            pattern: args.pattern ? args.pattern : '*',
            redis: $redisDataAccess.createClient(),
            each_callback: args.each_callback,
            done_callback: args.done_callback
        });
    }
};