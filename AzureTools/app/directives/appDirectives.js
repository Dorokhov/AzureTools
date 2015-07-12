exports.register = function (module) {
    'use strict';
    return module.directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if (event.which === 13) {
                    scope.$apply(function() {
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    }).directive('ngCtrlEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if (event.which === 13 && event.ctrlKey) {
                    scope.$apply(function() {
                        scope.$eval(attrs.ngCtrlEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    });
}