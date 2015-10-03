exports.create = function ($rootScope, $timeout) {
    'use strict';

    return new function() {
        var self = this;
        var opId = 0;

        self.IsBusy = false;
        self.Text = 'Loading...';
        self.Operations = {};
        self.CancelCallbacks = {};
        self.cancel = function () {
            self.IsBusy = false;

            for (var key1 in self.Operations) {
                self.Operations[key1] = false;
            }

            for (var key2 in self.CancelCallbacks) {
                self.CancelCallbacks[key2]();
            }
        };

        self.setIsBusy = function (operation, value, cancelCb) {
            self.IsBusy = value;

            self.Operations[operation] = value;
            self.CancelCallbacks[operation] = cancelCb;

            $timeout(function() {
                $rootScope.$apply();
            });
        };

        self.getIsBusy = function(operation) {
            if (self.Operations[operation] === null || self.Operations[operation] === undefined) {
                self.Operations[operation] = false;
            }

            return self.Operations[operation];
        };
    };
};