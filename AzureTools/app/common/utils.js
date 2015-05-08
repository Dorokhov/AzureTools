exports.create = function () {
    'use strict';
    return new function() {
        var self = this;
        self.safeJsonParse = function (value) {
            try {
                return JSON.parse(value);
            } catch (e) {
                throw {
                    name: 'Json Parse Error',
                    message: 'Invalid JSON "' + value + '"',
                    details: e
                }
            }
        };
    };
};