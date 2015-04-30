exports.create = function() {
    'use strict';

    return new function() {
        var self = this;

        self.Body = null;
        self.BodyViewModel = null;
        self.IsVisible = false;

        self.yes = function() {
            self.IsVisible = false;
        };

        self.no = function() {
            self.IsVisible = false;
        };
    }
};