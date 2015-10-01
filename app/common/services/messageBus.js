exports.create = function ($rootScope) {
    'use strict';
    return new function () {
        var self = this;

        self.publish = function (eventName, msg) {
            $rootScope.$emit(eventName, msg);
        };

        self.subscribe = function (eventName, cb) {
            if (eventName instanceof Array) {
                eventName.forEach(function(en) {
                    self.subscribe(en, cb);
                });
            }else if (typeof eventName === 'string') {
                $rootScope.$on(eventName, cb);
            } else {
                throw Error('TypeError: Unsupported type of "eventName" arg:' + typeof eventName);
            }
        };
    }
};