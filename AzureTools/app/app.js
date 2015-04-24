(function () {
    'use strict';

    var angular = require('./node_modules/angular/index.js');
    var angularRoute = require('./node_modules/angular-ui-router/release/angular-ui-router.js');

    window.$ = require('./node_modules/jquery/dist/jquery.js');
    var dataTable = require('./node_modules/datatables/media/js/jquery.dataTables.js');
    $.DataTable = dataTable;

    angular
        .module('dialogs', [angularRoute])
        .factory('$dialogViewModel', function() {
            return require('./common/dialogs/dialog.js').create();
        })
        .controller('DialogsController', [
            '$scope', '$dialogViewModel', function($scope, $dialogViewModel) {
                $scope.DialogViewModel = $dialogViewModel;
                $dialogViewModel.Body = '';
                $dialogViewModel.IsVisible = false;

                $scope.$on('$stateChangeStart',
                    function(evt, toState, toParams, fromState, fromParams) {
                        $dialogViewModel.IsVisible = false;
                    });
            }
        ]);

    angular
        .module('actionBar', [angularRoute])
        .factory('$actionBarItems', function () {
            return {};
        })
        .controller('ActionBarController', [
            '$scope', '$actionBarItems', function ($scope, $actionBarItems) {
                $scope.ActionBarItems = $actionBarItems;
            }
        ]);

    angular
        .module('tiles.redis', [angularRoute])
        .factory('$redisClientFactory', function () {
            var clientFactory =
                //require('./redis/model/redisClientFactory.js').createClient;
                require('./redis/model/redisClientFactoryMock.js').createClient;
            return clientFactory;
        })
        .factory('$dataTablePresenter', function () {
            return {};
        })
        .controller('RedisController', [
            '$scope', '$redisClientFactory', '$dataTablePresenter', '$actionBarItems', '$dialogViewModel',
            function ($scope, $redisClientFactory, $dataTablePresenter, $actionBarItems, $dialogViewModel) {
                $scope.RedisViewModel = require('./redis/viewModel/redisviewModel.js')
                    .create($redisClientFactory, $dataTablePresenter, $actionBarItems, $dialogViewModel);
            }
        ])
        .config(function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('redis', {
                    url: "/redis",
                    templateUrl: "redis/view/index.html",
                    controller: 'RedisController',
                    params: {
                        seq: {}
                    }
                });
        });

    angular
        .module('tiles', [angularRoute, 'actionBar'])
        .controller('TilesController', [
            '$scope', '$state', '$actionBarItems', function ($scope, $state, $actionBarItems) {
                $scope.TilesViewModel = require('./tiles/viewModel/tilesViewModel.js')
                    .create($state, $actionBarItems);
            }
        ])
        .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
            $stateProvider
                .state('tiles', {
                    url: "",
                    templateUrl: "tiles/view/index.html",
                    controller: 'TilesController',
                    params: {
                        seq: {}
                    }
                });
        });

    angular
        .module('app', ['actionBar', 'dialogs', 'tiles', 'tiles.redis']);
})();