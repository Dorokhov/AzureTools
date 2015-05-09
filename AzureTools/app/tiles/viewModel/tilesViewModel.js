exports.register = function (module) {
    'use strict';
    module.controller('TilesController', [
        '$scope', '$state', '$actionBarItems', function ($scope, $state, $actionBarItems) {
            $scope.TilesViewModel = new function () {
                var self = this;
                $actionBarItems.IsActionBarVisible = false;
                self.IsRedisVisible = false;

                self.openRedis = function () {
                    $state.go('redis', {});
                }

                self.openRedis();
            }
        }
    ]);
}