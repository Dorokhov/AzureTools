exports.create = function ($timeout) {
    'use strict';

    return new function() {
        var self = this;

        self.Body = null;
        self.IsVisible = false;

        self.showWarning = function (msg) {
            msg = 'Error! ' + msg;
            self.Body = msg;
            self.IsVisible = true;
        };

        self.showInfo = function (msg) {
            self.Body = msg;
            self.IsVisible = true;
        };

        self.close = function() {
            self.IsVisible = false;
        };

        self.scope = function () {
            return angular.element($("#errorNotification")).scope();
        }
    }
};