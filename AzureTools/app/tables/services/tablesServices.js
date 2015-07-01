exports.register = function (module) {
    'use strict';
    module
        .factory('tablesClient', function () {
            return require('../../node_modules/azure-table-node/index.js');
        });
}