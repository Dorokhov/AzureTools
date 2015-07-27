exports.register = function (module) {
    'use strict';
    module
        .factory('azureStorage', function () {
            return require('../../node_modules/azure-storage/lib/azure-storage.js');
        });
}