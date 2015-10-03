//var redisClientFactoryMock = require('../../redis/model/redisClientFactoryMock.js');

var redisScannerMock = function (args) {
    var redisMock = redisClientFactoryMock();
    redisMock.keys(args.key, function (err, keys) {
        var i = 0;
        var shouldProceed = true;
        while (shouldProceed) {
            if (i >= keys.length) {
                args.done_callback(null);
                shouldProceed = false;
            } else {
                redisMock.get(keys[i], function (item) {
                    if (Array.isArray(item.Value)) {
                        if (item.Type === 'set') {
                            for (var k = 0; k < item.Value.length; k++) {
                                args.each_callback(item.Type, item.Key, null, null, item.Value[k], function () {
                                    i++;
                                });
                            }
                        } else if (item.Type === 'hash') {
                            for (var j = 0; j < item.Value.length; j++) {
                                args.each_callback(item.Type, item.Key, item.Value[j][0], null, item.Value[j][1], function () {
                                    i++;
                                });
                            }
                        }
                    } else {
                        args.each_callback(item.Type, item.Key, null, null, item.Value, function () {
                            i++;
                        });
                    }
                });
            }
        }
    });
};

if (module != undefined && module) {
    module.exports = function () {
        return redisScannerMock;
    }
}