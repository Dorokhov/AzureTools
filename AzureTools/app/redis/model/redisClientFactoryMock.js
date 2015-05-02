var data = {a: 1, b:2};
exports.createClient = function () {
    return {
        keys: function (pattern, cb) {
            var allKeys = [];
            for (var propertyName in data) {
              // if (propertyName.match(pattern)) {
                    allKeys.push(propertyName);
              // }
            }
            cb(null, allKeys);
        },

        get: function (key, cb) {
            cb(null, data[key]);
        },

        set: function (key, value, cb) {
            data[key] = value;
            cb(null, {});
        }
    }
};