exports.create = function() {
    'use strict';

    return new function() {
        var self = this;

        self.Current = 0;
    }
};