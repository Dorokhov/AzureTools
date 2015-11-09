exports.register = function(module) {
    'use strict';
    module.controller('TilesController', [
        '$scope',
        '$state',
        '$timeout',
        '$actionBarItems',
        '$notifyViewModel',
        function($scope, $state, $timeout, $actionBarItems, $notifyViewModel) {
            $scope.TilesViewModel = new function() {
                var self = this;
                $actionBarItems.IsActionBarVisible = false;
                self.IsRedisVisible = true;
                self.IsRedisVisible = true;
                $notifyViewModel.close();
                self.openRedis = function() {
                    $state.go('redis', {});
                };

                self.openTables = function() {
                    $state.go('tables', {});
                };

                self.openBlobs = function() {
                    $state.go('blobs', {});
                };
            };
        }
    ]);
}