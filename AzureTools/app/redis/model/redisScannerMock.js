var redisClientFactoryMock = require('../../redis/model/redisClientFactoryMock.js');

module.exports = function (args) {
    redisClientFactoryMock.createClient().keys(args.key, function(err, keys) {
        var i = 0;
        var shouldProceed = true;
        while (shouldProceed) {
            if (i >= keys.length) {
                args.done_callback(null);
                shouldProceed = false;
            } else {
                redisClientFactoryMock.createClient().get(keys[i], function (value) {
                    args.each_callback('string', keys[i], null, null, value, function () {
                        i++;
                    });
                });
            }
        }
    });
};
