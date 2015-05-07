exports.create = function ($rootScope) {
    'use strict';
    return new function () {
        var self = this;

        self.publish = function (eventName, msg) {
            $rootScope.$emit(eventName, msg);
        };

        self.subscribe = function (eventName, cb) {
            $rootScope.$on(eventName, cb);
        };
    }
};