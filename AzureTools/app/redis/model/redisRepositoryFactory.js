exports.create = function (stringRepo, setRepo, hashSetRepo) {
    'use strict';

    return function (type) {
        var self = this;

        switch (type) {
            case 'string':
                return stringRepo;
            case 'set':
                return setRepo;
            case 'hash set':
            case 'hash':
                return hashSetRepo;
            default:
                throw new Error('Unsupported creating data type: ' + type);
        }
    };
};