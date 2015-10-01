exports.register = function (angular, angularRoute) {
    'use strict';
    
    angular
        .module('common', [angularRoute])
        .factory('$busyIndicator', [
            '$rootScope', '$timeout', function ($rootScope, $timeout) {
                return require('./services/busyIndicator.js').create($rootScope, $timeout);
            }
        ])
        .factory('$validator', [function () {
            return require('./services/validator.js').create();
        }
        ])
        .factory('$messageBus', [
            '$rootScope', function ($rootScope) {
                return require('./services/messageBus.js').create($rootScope);
            }
        ])
        .factory('$utils', [function () {
            return require('./services/utils.js').create();
        }
        ])
        .controller('BusyIndicatorController', [
            '$scope', '$busyIndicator', function ($scope, $busyIndicator) {
                $scope.BusyIndicator = $busyIndicator;
            }
        ]);
}