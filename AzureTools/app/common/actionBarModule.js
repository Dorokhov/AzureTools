exports.register = function (angular) {
    'use strict';

    angular
        .module('actionBar', [])
        .factory('$actionBarItems', function () {
            return { IsActionBarVisible: false };
        })
        .controller('ActionBarController', [
            '$scope', '$state', '$actionBarItems', function ($scope, $state, $actionBarItems) {
                $scope.ActionBarItems = $actionBarItems;
                $scope.state = $state;
            }
        ]);
}