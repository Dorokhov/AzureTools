exports.create = function() {
    'use strict';

    return new function() {
        var self = this;
        if (isDebugVersion) {
            self.Host = 'redisdor.redis.cache.windows.net';
            self.Port = 6379;
            self.Password = 'ZaVlBh0AHJmw2r3PfWVKvm7X3FfC5fe+sMKJ93RueNY=';
        } else {
            self.Host = '';
            self.Port = 6379;
            self.Password = '';
        }

        self.isEmpty = function() {
            return (self.Host === null || self.Host === '') &&
            (self.Password === null || self.Password === '');
        };
    }
};