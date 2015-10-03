exports.register = function (angular, angularRoute) {
    'use strict';

    angular
        .module('dialogs', [angularRoute])
        .factory('$dialogViewModel', function () {
            return require('./dialogs/dialog.js').create();
        })
        .factory('$confirmViewModel', function () {
            return require('./dialogs/confirmation.js').create();
        })
        .factory('$notifyViewModel', ['$timeout', function ($timeout) {
            return require('./dialogs/notification.js').create($timeout);
        }])
        .controller('DialogsController', [
            '$scope', '$dialogViewModel', '$notifyViewModel', function ($scope, $dialogViewModel, $notifyViewModel) {
                $scope.DialogViewModel = $dialogViewModel;
                $scope.NotifyViewModel = $notifyViewModel;

                $dialogViewModel.Body = '';
                $dialogViewModel.IsVisible = false;

                $scope.$on('$stateChangeStart',
                    function () {
                        $dialogViewModel.IsVisible = false;
                    });
            }
        ])
        .controller('ConfirmationController', [
            '$scope', '$confirmViewModel', function ($scope, $confirmViewModel) {
                $scope.ConfirmationViewModel = $confirmViewModel;
            }
        ]);
}