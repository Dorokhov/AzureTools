exports.create = function() {
    'use strict';

    var dialog = new function() {
        var self = this;

        self.Body = null;
        self.BodyViewModel = null;
        self.IsVisible = false;
        self.IsChecked = false;
        self.WithOption = false;
        self.OptionText = '';
        self.AreButtonsDisabled = false;
        self.onChecked = function() {

        };

        self.save = function() {
            self.IsVisible = false;
        };

        self.cancel = function() {
            self.IsVisible = false;
        };
    };
    return function() {
        dialog.Body = null;
        dialog.BodyViewModel = null;
        dialog.IsVisible = false;
        dialog.IsChecked = false;
        dialog.WithOption = false;
        dialog.OptionText = '';
        dialog.AreButtonsDisabled = false;

        return dialog;
    };
};