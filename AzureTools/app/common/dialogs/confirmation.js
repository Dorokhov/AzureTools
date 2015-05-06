exports.create = function () {
    'use strict';

    return new function () {
        var self = this;
        var onConfirmedCb = null;
        var onDeclinedCb = null;

        self.Header = 'Confirm';
        self.Body = null;
        self.BodyViewModel = null;
        self.IsVisible = false;

        self.yes = function () {
            self.IsVisible = false;
            if (onConfirmedCb) {
                onConfirmedCb();
            }
        };

        self.no = function () {
            self.IsVisible = false;
            if (onDeclinedCb) {
                onDeclinedCb();
            }
        };

        self.show = function (onConfirmed, onDeclined) {
            console.log("confirm");
            self.IsVisible = true;
            onConfirmedCb = onConfirmed;
            onDeclinedCb = onDeclined;
        };

        self.scope = function() {
            return angular.element($("#confirmationDialog")).scope();
        }
    }
};