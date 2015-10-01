exports.create = function ($activeDatabase, $redisClientFactory, $redisSettings, $messageBus) {
    'use strict';
    return new function() {
        var self = this;
        var client = null;

        self.createClient = function() {
            if (client == null || client.connected === false || (client.port !== $redisSettings.Port || client.host !== $redisSettings.Host || client.options.auth_pass !== $redisSettings.Password)) {
                client = $redisClientFactory($redisSettings.Host, $redisSettings.Port, $redisSettings.Password);
            }

            if ($activeDatabase.Current !== null) {
                client.select($activeDatabase.Current);
            }
            client.on("error", function(msg) {
                console.log('error ' + msg);
                client.end();
                $messageBus.publish('redis-communication-error', msg);
            });
            client.on("end", function(msg) {
                console.log('end...');
                client.end();
                $messageBus.publish('redis-communication-error', msg);
            });
            client.on("reconnecting", function(msg) {
                console.log('reconnecting...');
            });
            return client;
        };
    };
};