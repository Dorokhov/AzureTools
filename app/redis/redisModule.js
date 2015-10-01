exports.register = function (angular, angularRoute) {
    'use strict';

    var redisModule = angular
        .module('tiles.redis', [angularRoute]);
    require('./services/redisServices.js').register(redisModule);
    require('./viewModel/redisViewModel.js').register(redisModule);
    redisModule
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
}