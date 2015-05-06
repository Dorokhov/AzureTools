exports.create = function ($activeDatabase, $redisClientFactory, $redisSettings) {
    'use strict';
    return new function () {
        var self = this;

        self.createClient = function () {
            var client = $redisClientFactory($redisSettings.Host, $redisSettings.Port, $redisSettings.Password);
            if ($activeDatabase.Current !== null) {
                client.select($activeDatabase.Current);
            }

            return client;
        }
    }
};