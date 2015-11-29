exports.register = function(module) {
    'use strict';
    return module.directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind('keydown keypress', function(event) {
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
            element.bind('keydown keypress', function(event) {
                if (event.which === 13 && event.ctrlKey) {
                    scope.$apply(function() {
                        scope.$eval(attrs.ngCtrlEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    })

    .directive('bgSplitter', function() {
            return {
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: {
                    orientation: '@'
                },
                template: '<div class="split-panes {{orientation}}" ng-transclude></div>',
                controller: [
                    '$scope',
                    function($scope) {
                        $scope.panes = [];

                        this.addPane = function(pane) {
                            if ($scope.panes.length > 1) {
                                throw 'splitters can only have two panes';
                            }
                            $scope.panes.push(pane);
                            return $scope.panes.length;
                        };
                    }
                ],
                link: function(scope, element) {
                    var handler = angular.element('<div class="split-handler"></div>'),
                        pane1 = scope.panes[0],
                        pane2 = scope.panes[1],
                        vertical = scope.orientation == 'vertical',
                        pane1Min = pane1.minSize || 0,
                        pane2Min = pane2.minSize || 0,
                        pane1Max = pane1.maxSize || 0,
                        pane2Max = pane2.maxSize || 0,
                        drag = false,
                        pane2Percentage = pane2.initPercentage ? (100 % -pane2.initPercentage) : 50,
                        pane1Percentage = pane1.initPercentage ? pane1.initPercentage : pane2Percentage,
                        b, w, p, h;

                    if (vertical) {
                        b = element[0].getBoundingClientRect();
                        h = b.bottom - b.top;
                        p = pane1Percentage * 0.01 * h;
                        console.log('h' + h)
                        handler.css('top', p + 'px');
                        pane1.elem.css('height', p + 'px');
                        pane2.elem.css('top', p + 'px');
                    } else {
                        b = element[0].getBoundingClientRect();
                        w = b.right - b.left;
                        p = pane1Percentage * 0.01 * w;

                        handler.css('left', p + 'px');
                        pane1.elem.css('width', p + 'px');
                        pane2.elem.css('left', p + 'px');
                    }

                    pane1.elem.after(handler);

                    element.bind('mousemove', function(ev) {
                        var bounds, pos, height, width;
                        if (!drag) {
                            return;
                        }

                        bounds = element[0].getBoundingClientRect();
                        pos = 0;

                        if (vertical) {

                            height = bounds.bottom - bounds.top;
                            pos = ev.clientY - bounds.top;

                            if (pos < pane1Min) {
                                return;
                            }
                            if (height - pos < pane2Min) {
                                return;
                            }
                            if (pos > pane1Max && pane1Max != 0) {
                                return;
                            }
                            if ((height - pos >= pane2Max) && pane2Max != 0) {
                                return;
                            }

                            handler.css('top', pos + 'px');
                            pane1.elem.css('height', pos + 'px');
                            pane2.elem.css('top', pos + 'px');

                        } else {
                            width = bounds.right - bounds.left;
                            pos = ev.clientX - bounds.left;

                            if (pos < pane1Min) {
                                return;
                            }
                            if (pos > pane2Max && pane2Max != 0) {
                                return;
                            }
                            if (width - pos < pane2Min) {
                                return;
                            }
                            if ((width - pos > pane2Max) && pane2Max != 0) {
                                return;
                            }

                            handler.css('left', pos + 'px');
                            pane1.elem.css('width', pos + 'px');
                            pane2.elem.css('left', pos + 'px');
                        }
                    });

                    handler.bind('mousedown', function(ev) {
                        drag = false;
                        ev.preventDefault();
                        drag = true;
                    });

                    angular.element(document).bind('mouseup', function() {
                        if (drag === true) {
                            scope.$emit('splitter-resize');
                        }

                        drag = false;
                    });
                }
            };
        })
        .directive('bgPane', function() {
            return {
                restrict: 'E',
                require: '^bgSplitter',
                replace: true,
                transclude: true,
                scope: {
                    minSize: '=',
                    maxSize: '=',
                    initPercentage: '='
                },
                template: '<div class="split-pane{{index}}" ng-transclude></div>',
                link: function(scope, element, attrs, bgSplitterCtrl) {
                    scope.elem = element;
                    scope.index = bgSplitterCtrl.addPane(scope);
                }
            };
        })

    .directive('fcWindow', ['$document', function($document) {
        'use strict';
        var HEADER_CLASS = '_header-a8fe';
        var CORNER_CLASS = '_corner-3cf7';
        return {
            scope: {
                'fcWindow': '='
            },
            compile: function(element, attr) {

                appendExtraElements();

                function appendExtraElements() {
                    element.append('<div class="' + HEADER_CLASS + '"></div>');
                    element.append('<div class="' + CORNER_CLASS + '"></div>');
                }

                return function(scope, element, attr) {
                    var header = angular.element(element[0].querySelector('.' + HEADER_CLASS));
                    var corner = angular.element(element[0].querySelector('.' + CORNER_CLASS));
                    var options = scope.fcWindow;

                    applyStyles(options);

                    var rect = getOffsetRect(document.body, element[0]);
                    var startX = 0,
                        startY = 0,
                        x = rect.left,
                        y = rect.top,
                        startHeight = 0,
                        startWidth = 0,
                        height = element.prop('offsetHeight'),
                        width = element.prop('offsetWidth');

                    header[0].addEventListener('mousedown', function(event) {
                        // Prevent default dragging of selected content
                        event.preventDefault();
                        startX = event.pageX - x;
                        startY = event.pageY - y;
                        $document.on('mousemove', pMousemove);
                        $document.on('mouseup', pMouseup);
                    });

                    corner[0].addEventListener('mousedown', function(event) {
                        // Prevent default dragging of selected content
                        event.preventDefault();
                        startWidth = event.pageX - x - width;
                        startHeight = event.pageY - y - height;
                        $document.on('mousemove', sMousemove);
                        $document.on('mouseup', sMouseup);
                    });

                    function pMousemove(event) {
                        y = event.pageY - startY;
                        x = event.pageX - startX;
                        element.css({
                            top: y + 'px',
                            left: x + 'px'
                        });
                    }

                    function pMouseup() {
                        $document.off('mousemove', pMousemove);
                        $document.off('mouseup', pMouseup);
                    }

                    function sMousemove(event) {
                        height = event.pageY - y - startHeight;
                        width = event.pageX - x - startWidth;
                        element.css({
                            height: height + 'px',
                            width: width + 'px'
                        });
                    }

                    function sMouseup() {
                        $document.off('mousemove', sMousemove);
                        $document.off('mouseup', sMouseup);
                    }

                    function getOffsetRect(parent, child) {
                        var parentRect = parent.getBoundingClientRect();
                        var childRect = child.getBoundingClientRect();
                        var result = {};
                        for (var i in parentRect) {
                            result[i] = childRect[i] - parentRect[i];
                        }
                        return result;
                    }


                    function applyStyles(options) {
                        element.css({
                            padding: options.headerHeight + 'px 0 0',
                            position: 'absolute',
                            border: [options.borderStyle, options.headerColor].join(' ')
                        });

                        header.css({
                            position: 'absolute',
                            top: 0,
                            height: options.headerHeight + 'px',
                            width: '100%',
                            background: options.headerColor,
                            cursor: 'move'
                        });

                        corner.css({
                            position: 'absolute',
                            bottom: -options.cornerSize / 2 + 'px',
                            right: -options.cornerSize / 2 + 'px',
                            width: options.cornerSize + 'px',
                            height: options.cornerSize + 'px',
                            background: options.cornerColor || options.headerColor,
                            transform: 'rotate(45deg)',
                            cursor: 'nwse-resize'
                        });
                    }
                };
            }
        };
    }])
}