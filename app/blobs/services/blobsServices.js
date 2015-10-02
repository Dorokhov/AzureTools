exports.register = function (module) {
    'use strict';
    module
        .factory('azureStorage', function () {
            return require('azure-storage');
        })
        .factory('bufferFactory', function () {
            return require('./../../../libs/net-chromify/node_modules/buffer/index');
        });
}