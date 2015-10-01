exports.register = function (module) {
    'use strict';
    module
        .factory('azureStorage', function () {
            return require('../../node_modules/azure-storage/lib/azure-storage.js');
        })
        .factory('bufferFactory', function () {
            return require('./../../node_modules/net-chromify/node_modules/buffer/index');
        });
}