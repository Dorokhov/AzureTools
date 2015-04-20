(function () {
    var angular = require('./node_modules/angular/index.js');
    var angularRoute = require('./node_modules/angular-ui-router/release/angular-ui-router.js');

    window.$ = require('./node_modules/jquery/dist/jquery.js');
    var dataTable = require('./node_modules/datatables/media/js/jquery.dataTables.js');
    $.DataTable = dataTable;

    angular.RedisController = function ($scope, $restClient, $dataTablePresenter) {
        $scope.RedisViewModel = require('./redis/viewModel/redisviewModel.js')
            .RedisViewModel($restClient, $dataTablePresenter);
    };

    angular
        .module('actionBar',[])
        .factory('$actionBarItems', function () {
            return {};
        })
        .controller('ActionBarController', [
            '$scope', function($scope) {
            $scope.T = 't';
        }
        ]);

    angular
        .module('tiles.redis', [angularRoute, 'actionBar'])
        .factory('$redisClientFactory', function() {
            var clientFactory =
                //require('./redis/model/redisClientFactory.js').createClient;
                require('./redis/model/redisClientFactoryMock.js').createClient;
            return clientFactory;
        })
        .factory('$dataTablePresenter', function() {
            return {};
        })
        .controller('RedisController', [
            '$scope', '$redisClientFactory', '$dataTablePresenter', function($scope, $redisClientFactory, $dataTablePresenter) {
                $scope.RedisViewModel = require('./redis/viewModel/redisviewModel.js')
                    .create($redisClientFactory, $dataTablePresenter);
            }
        ])
        .config(function($stateProvider, $urlRouterProvider) {
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
        .module('tiles', [angularRoute])
        .controller('TilesController', ['$scope', '$state', function ($scope, $state) {
            $scope.TilesViewModel = require('./tiles/viewModel/tilesViewModel.js')
                .create($state);
        }])
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
        .module('app', ['tiles', 'tiles.redis']);
})();