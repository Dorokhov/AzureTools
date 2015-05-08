exports.create = function() {
    'use strict';

    return new function() {
        var self = this;

        self.Body = null;
        self.BodyViewModel = null;
        self.IsVisible = false;
        self.IsChecked = false;
        self.WithOption = false;
        self.OptionText = '';
        self.save = function() {
            self.IsVisible = false;
        };

        self.cancel = function() {
            self.IsVisible = false;
        };
    }
};