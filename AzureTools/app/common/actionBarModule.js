exports.register = function (angular) {
    'use strict';

    angular
        .module('actionBar', [])
        .factory('$actionBarItems', function () {
            return { IsActionBarVisible: false };
        })
        .controller('ActionBarController', [
            '$scope', '$actionBarItems', function ($scope, $actionBarItems) {
                $scope.ActionBarItems = $actionBarItems;
            }
        ]);
}