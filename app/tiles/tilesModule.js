exports.register = function (angular, angularRoute) {
    'use strict';

    var tilesModule = angular.module('tiles', [angularRoute, 'actionBar']);
    require('./viewModel/tilesViewModel.js').register(tilesModule);
    tilesModule.config(function ($stateProvider) {
        $stateProvider
            .state('tiles', {
                url: '',
                templateUrl: 'tiles/view/index.html',
                controller: 'TilesController',
                params: {
                    seq: {}
                }
            });
    });
}