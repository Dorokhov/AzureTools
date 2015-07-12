exports.register = function (module) {
    'use strict';
    module.controller('TilesController', [
        '$scope', 
        '$state',
        '$actionBarItems',
        '$notifyViewModel',
        function ($scope, $state, $actionBarItems, $notifyViewModel) {
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
            };
        }
    ]);
}