var data = [{ Key: 'a', Type: 'string', Value: '' }];
var redisClientFactoryMock = function () {
    return {
        keys: function (pattern, cb) {
            var allKeys = [];
            for (var i = 0; i < data.length; i++) {
                allKeys.push(data[i].Key);
            }
            cb(null, allKeys);
        },

        get: function (key, cb) {
            var item = null;
            for (var i = 0; i < data.length; i++) {
                //console.log('data[i].Key:' + data[i].Key + ' key:' + key);
                if (data[i].Key === key) {
                    item = data[i];
                }
            }

            if (cb) {
                 cb(item);
            }
        },

        set: function (key, value, cb) {
            this.get(key, function(item) {
                if (item == null) {
                    data.push({
                        Key: key,
                        Type: 'string',
                        Value: value
                    });
                } else {
                    item.Value = value;
                }

                if (cb) {
                    cb(null, {});
                }
            });
        },

        hset: function (key, subKey, value, cb) {
            this.get(key, function (item) {
                if (item == null) {
                    data.push({
                        Key: key,
                        Type: 'hash',
                        Value: [[subKey, value]]
                    });
                } else {
                    item.Value.push([subKey, value]);
                }

                if (cb) {
                    cb(null, {});
                }
            });
        },

        sadd: function (key, value, cb) {
            this.get(key, function (item) {
                if (item == null) {
                    data.push({
                        Key: key,
                        Type: 'set',
                        Value: value
                    });
                } else {
                    for (var i = 0; i < value.length; i++) {
                        item.Value.push(value[i]);
                    }
                }

                if (cb) {
                    cb(null, {});
                }
            });
        },

        del: function (key) {
            data.pop(this.get(key));
        },

        select: function () { },
        on: function () { }
    }
};

if (typeof exports != 'undefined' && exports != null)
    exports.createClient = redisClientFactoryMock.createClient;