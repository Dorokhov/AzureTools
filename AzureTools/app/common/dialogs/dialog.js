exports.create = function() {
    'use strict';

    return new function() {
        'use strict';

        var self = this;

        self.Body = null;
        self.BodyViewModel = null;
        self.IsVisible = false;

        self.save = function() {
            self.IsVisible = false;
        };

        self.cancel = function() {
            self.IsVisible = false;
        };
    }
};