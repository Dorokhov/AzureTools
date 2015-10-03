exports.register = function (angular) {
    'use strict';
    var supportEmail = 'azuretools@gmail.com';
    angular
    .module('exceptionOverride', [])
    .factory('$exceptionHandler', [function () {
        return function (exception, cause) {
            var data = {
                type: 'angular',
                url: window.location.hash,
                localtime: Date.now()
            }, el, alertArea;

            if (cause) { data.cause = cause; }
            if (exception) {
                if (exception.message) { data.message = exception.message; }
                if (exception.name) { data.name = exception.name; }
                if (exception.stack) { data.stack = exception.stack; }
            }

            el = document.getElementById('sendEmail');
            alertArea = document.getElementById('alertArea');

            if (el && alertArea) {
                alertArea.style.display = 'block';
                el.href = 'mailto:' + supportEmail + '?subject=' + 'Bug Report' + '&body='
                    + data.message + '|' + data.name + '|' + data.stack
                + '|' + data.type + '|' + data.url + '|' + data.localtime;
            }

            throw exception;
        };
    }]);
}