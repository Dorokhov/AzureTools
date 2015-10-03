exports.register = function (module) {
    'use strict';
    module
        .factory('azureStorage', function () {
            return require('azure-storage');
        });
}