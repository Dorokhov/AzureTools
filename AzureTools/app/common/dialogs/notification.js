exports.create = function ($timeout) {
    'use strict';

    return new function() {
        var self = this;

        self.Body = null;
        self.IsVisible = false;
        self.CommandText = null;
        self.Command = null;

        self.showWarning = function(msg, cb) {
            msg = 'Error! ' + msg;
            self.Body = msg;
            self.IsVisible = true;
        };

        self.showInfo = function(msg, commandText, command) {
            self.Body = msg;
            self.IsVisible = true;
            self.CommandText = commandText;
            self.Command = command;
        };

        self.close = function() {
            self.IsVisible = false;
            self.CommandText = null;
            self.Command = null;
        };

        self.scope = function() {
            return angular.element($("#errorNotification")).scope();
        };
    };
};