exports.create = function (stringRepo, setRepo) {
    'use strict';

    return function (type) {
        var self = this;

        switch (type) {
            case 'string':
                return stringRepo;
            case 'set':
                return setRepo;
            default:
                throw new Error('Unsupported creating data type: ' + type);
        }
    };
};