exports.create = function() {
    'use strict';

    return new function() {
        var self = this;
        function validateNum(input, min, max) {
            var num = +input;
            console.log('validate input:' + input + ' num:' + num + ' min:' + min + ' max:' + max
                + ' num >= min:' + (num >= min) + ' num <= max' + (num <= max) + ' input === num.toString():' + (input === num.toString()));
            return num >= min && num <= max;
        }

        self.validatePort = function (port) {
            return validateNum(port, 1, 65535);
        };
    }
};