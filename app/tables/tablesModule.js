exports.register = function (angular, angularRoute) {
    'use strict';

    var tablesModule = angular.module('tiles.tables', [angularRoute]);
    require('./services/tablesServices.js').register(tablesModule);

    tablesModule.factory('tablesPresenter', [
        function () {
            return require('./presenter/tablesPresenter.js').create();
        }
    ]);

    require('./viewModel/tablesViewModel.js').register(tablesModule);
    tablesModule.factory('tablesSettings', function () {
        return require('./model/tablesSettings.js').create();
    });
    tablesModule
       .config(function ($stateProvider) {
           $stateProvider
               .state('tables', {
                   url: '/tables',
                   templateUrl: 'tables/view/index.html',
                   controller: 'TablesController',
                   params: {
                       seq: {}
                   }
               });
       });
}