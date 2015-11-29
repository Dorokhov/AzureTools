(function() {
    'use strict';
    //require('process');
    var angular = require('angular'),
        angularRoute = require('angular-ui-router'),
        dataTable = require('datatables'),
        uiGrid = require('ui-grid'),
        dranDrop = require('angular-dragdrop'),
        resizable = require('angular-resizable'),
        app;

    window.$ = require('jquery');
    window.$.DataTable = dataTable;
    window.$.dataTable = dataTable;

    var jqueryUI = require('jquery-ui');

    var reorder = require('colReorder');
    var colVis = require('colVis');
    var colResize = require('colResize');
    var select = require('dataTablesSelect')($);

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
            'ui.grid',
            'ui.grid.autoResize',
            'ui.grid.selection',
            'ngDragDrop',
            'angularResizable',
            'exceptionOverride',
            'common',
            'actionBar',
            'dialogs',
            'tiles',
            'tiles.redis',
            'tiles.tables',
            'tiles.blobs',
        ], function() {});
    require('./directives/appDirectives.js')
        .register(app)
        .controller('AppController', ['$state', function() {}]);
}());