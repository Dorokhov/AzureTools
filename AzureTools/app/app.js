(function () {
    'use strict';
    //require('process');
    var angular = require('./node_modules/angular/index.js');
    var angularRoute = require('./node_modules/angular-ui-router/release/angular-ui-router.js');

    window.$ = require('./node_modules/jquery/dist/jquery.js');
    var dataTable = require('./node_modules/datatables/media/js/jquery.dataTables.js');
    $.DataTable = dataTable;

    window.isDebugVersion = false;

    require('./exceptionHandling/exceptionHandlingModule.js').register(angular);
    require('./common/commonModule.js').register(angular, angularRoute);
    require('./common/dialogsModule.js').register(angular, angularRoute);
    require('./common/actionBarModule.js').register(angular);
    require('./redis/redisModule.js').register(angular, angularRoute);
    require('./tables/tablesModule.js').register(angular, angularRoute);
    require('./tiles/tilesModule.js').register(angular, angularRoute);

    var app = angular
        .module('app', [
            'exceptionOverride',
            'common',
            'actionBar',
            'dialogs',
            'tiles',
            'tiles.redis',
            'tiles.tables',
        ], function() {});
    require('./directives/appDirectives.js')
        .register(app)
        .controller('AppController', ['$state', function ($state) { }]);
})();