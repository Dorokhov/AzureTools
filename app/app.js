(function () {
    'use strict';
    //require('process');
    var angular = require('angular'),
        angularRoute = require('angular-ui-router'),
        dataTable = require('datatables'),
        app;

    window.$ = require('jquery');
    window.$.DataTable = dataTable;

    window.isDebugVersion = false;

    require('./exceptionHandling/exceptionHandlingModule.js').register(angular);
    require('./common/commonModule.js').register(angular, angularRoute);
    require('./common/dialogsModule.js').register(angular, angularRoute);
    require('./common/actionBarModule.js').register(angular);
    require('./redis/redisModule.js').register(angular, angularRoute);
    require('./tables/tablesModule.js').register(angular, angularRoute);
    require('./blobs/blobsModule.js').register(angular, angularRoute);
    require('./tiles/tilesModule.js').register(angular, angularRoute);

    app = angular
        .module('app', [
            'exceptionOverride',
            'common',
            'actionBar',
            'dialogs',
            'tiles',
            'tiles.redis',
            'tiles.tables',
            'tiles.blobs',
        ], function () {});
    require('./directives/appDirectives.js')
        .register(app)
        .controller('AppController', ['$state', function () { }]);
}());