exports.create = function($redisDataAccess, $redisRepositoryFactory) {
    'use strict';

    return new function() {
        var self = this;

        var groupByKey = function(type, key, value) {
            var existing = $scope.keyOptions.data.filter(function(item) {
                return item.Key == key;
            });

            if (existing !== null && existing[0] !== undefined) {
                var values = JSON.parse(existing[0].Value);
                values.push(value);
                existing[0].Value = JSON.stringify(values);
            } else {
                $scope.keyOptions.data.push({
                    Key: key,
                    Type: type,
                    Value: JSON.stringify([value])
                });
                return true;
            }

            return false;
        };

        self.getKey = function(key, cb) {
            self.safeRedisCmd(function(client) {
                client.type(key, function(err, res) {
                    var type = res;
                    var repo = $redisRepositoryFactory(type);
                    repo.get(key, function(err, result) {
                        if (err) console.log(err);

                        var item = {
                                Key: key,
                                Type: type,
                                Value: result
                            };
                        cb(item);
                    });
                });
            });

        };
    };
};