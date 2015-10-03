exports.register = function (module) {
    'use strict';
    module
        .factory('$redisClientFactory', function () {
            var clientFactory =
                require('../model/redisClientFactory.js').createClient;
            return clientFactory;
        })
        .factory('$redisScanner', function () {
            return require('redisscan');
        })
        .factory('$redisSettings', function () {
            return require('../model/redisSettings.js').create();
        })
        .factory('$dataTablePresenter', [
            '$redisClientFactory', '$redisSettings', function ($redisClientFactory, $redisSettings) {
                return require('../presenter/redisPresenter.js').create($redisClientFactory, $redisSettings);
            }
        ])
        .factory('$redisDataAccess', [
            '$activeDatabase', '$redisClientFactory', '$redisSettings', '$messageBus', function ($activeDatabase, $redisClientFactory, $redisSettings, $messageBus) {
                return require('../model/redisDataAccess.js').create($activeDatabase, $redisClientFactory, $redisSettings, $messageBus);
            }
        ])
        .factory('$activeDatabase', [
            function () {
                return require('../model/activeDatabase.js').create();
            }
        ])
        .factory('$baseRepo', [
            '$redisDataAccess', '$utils', function ($redisDataAccess, $utils) {
                return require('../model/baseRepository.js').create($redisDataAccess, $utils);
            }
        ])
        .factory('$stringRepo', [
            '$baseRepo', '$redisDataAccess', function ($baseRepo, $redisDataAccess) {
                var stringRepo = require('../model/stringRepository.js').create($redisDataAccess);
                angular.extend(stringRepo, $baseRepo);
                return stringRepo;
            }
        ])
        .factory('$setRepo', [
            '$baseRepo', '$redisDataAccess', function ($baseRepo, $redisDataAccess) {
                var setRepo = require('../model/setRepository.js').create($redisDataAccess);
                angular.extend(setRepo, $baseRepo);
                return setRepo;
            }
        ])
        .factory('$hashSetRepo', [
            '$baseRepo', '$redisDataAccess', function ($baseRepo, $redisDataAccess) {
                var hashRepo = require('../model/hashRepository.js').create($redisDataAccess);
                angular.extend(hashRepo, $baseRepo);
                return hashRepo;
            }
        ])
        .factory('$redisRepositoryFactory', [
            '$stringRepo', '$setRepo', '$hashSetRepo', function ($stringRepo, $setRepo, $hashSetRepo) {
                return require('../model/redisRepositoryFactory.js').create($stringRepo, $setRepo, $hashSetRepo);
            }
        ])
        .factory('$redisScannerFactory', [
            '$redisDataAccess', '$redisScanner',
            function ($redisDataAccess, $redisScanner) {
                return require('../model/redisScannerFactory.js').create($redisDataAccess, $redisScanner);
            }
        ]);
}