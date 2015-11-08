exports.register = function (module) {
    'use strict';
    return module.directive('ngEnter', function () {
        return function (scope, element, attrs) {
            element.bind('keydown keypress', function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    }).directive('ngCtrlEnter', function () {
        return function (scope, element, attrs) {
            element.bind('keydown keypress', function (event) {
                if (event.which === 13 && event.ctrlKey) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngCtrlEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    })

        .directive('bgSplitter', function () {
            return {
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: {
                    orientation: '@'
                },
                template: '<div class="split-panes {{orientation}}" ng-transclude></div>',
                controller: [
                    '$scope', function ($scope) {
                        $scope.panes = [];

                        this.addPane = function (pane) {
                            if ($scope.panes.length > 1) {
                                throw 'splitters can only have two panes';
                            }
                            $scope.panes.push(pane);
                            return $scope.panes.length;
                        };
                    }
                ],
                link: function (scope, element) {
                    var handler = angular.element('<div class="split-handler"></div>'),
                        pane1 = scope.panes[0],
                        pane2 = scope.panes[1],
                        vertical = scope.orientation == 'vertical',
                        pane1Min = pane1.minSize || 0,
                        pane2Min = pane2.minSize || 0,
                        drag = false,
                        pane2Percentage = pane2.initWidthPercentage ? (100 % -pane2.initWidthPercentage) : 50,
                        pane1Percentage = pane1.initWidthPercentage ? pane1.initWidthPercentage : pane2Percentage,
                        b, w, p;
                    
                    if (!vertical) {
                        b = element[0].getBoundingClientRect();
                        w = b.right - b.left;
                        p = pane1Percentage * 0.01 * w;
                        
                        handler.css('left', p + 'px');
                        pane1.elem.css('width', p + 'px');
                        pane2.elem.css('left', p + 'px');
                    }

                    pane1.elem.after(handler);

                    element.bind('mousemove', function (ev) {
                        var bounds, pos, height, width;
                        if (!drag) { return; }

                        bounds = element[0].getBoundingClientRect();
                        pos = 0;

                        if (vertical) {

                            height = bounds.bottom - bounds.top;
                            pos = ev.clientY - bounds.top;

                            if (pos < pane1Min) { return; }
                            if (height - pos < pane2Min) { return; }

                            handler.css('top', pos + 'px');
                            pane1.elem.css('height', pos + 'px');
                            pane2.elem.css('top', pos + 'px');

                        } else {
                            width = bounds.right - bounds.left;
                            pos = ev.clientX - bounds.left;

                            if (pos < pane1Min) { return; }
                            if (width - pos < pane2Min) { return; }

                            handler.css('left', pos + 'px');
                            pane1.elem.css('width', pos + 'px');
                            pane2.elem.css('left', pos + 'px');
                        }
                    });

                    handler.bind('mousedown', function (ev) {
                        ev.preventDefault();
                        drag = true;
                    });

                    angular.element(document).bind('mouseup', function () {
                        drag = false;
                        scope.$emit('splitter-resize')
                    });
                }
            };
        })
        .directive('bgPane', function () {
            return {
                restrict: 'E',
                require: '^bgSplitter',
                replace: true,
                transclude: true,
                scope: {
                    minSize: '=',
                    initWidthPercentage: '='
                },
                template: '<div class="split-pane{{index}}" ng-transclude></div>',
                link: function (scope, element, attrs, bgSplitterCtrl) {
                    scope.elem = element;
                    scope.index = bgSplitterCtrl.addPane(scope);
                }
            };
        });
}