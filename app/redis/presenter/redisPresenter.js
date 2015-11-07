exports.create = function(redisClientFactory, $redisSettings) {
    'use strict';

    return new function() {
        var self = this;
        self.oTable = null;
        self.oValueTable = null;
        self.Keys = null;
        self.cleanUp = function() {
            if (self.oTable) {
                self.oTable.destroy();
            }

        };

        self.showKeys = function(data, onselect) {
            self.Keys = data;

            var calcDataTableHeight = function() {
                return ($(window).height() - 150);
            };

            self.cleanUp();

            $(window).unbind('resize');
            $(window).bind('resize', function() {
                $('.dataTables_scrollBody').css('height', calcDataTableHeight());
                self.oTable.columns.adjust().draw();
            });

            self.oTable = $('#data').DataTable({
                bFilter: false,
                bInfo: false,
                bPaginate: false,
                scrollY: calcDataTableHeight(),
                //scrollCollapse: true,
                data: self.Keys,
                autoWidth: false,
                sDom: 'rt',
                columns: [{
                    //"title": "Key",
                    "data": "Key"
                }],
                select: true
            });

            self.oTable.off('select');
            self.oTable.on('select', function(e, dt) {
                var rows = dt.rows({
                    selected: true
                }).data();
                if (onselect) onselect(rows);
            });
        }

        self.showSet = function(data) {
            var tableId = 'setTable';
            if ((data == null || data.length == 0)) {
                $('#' + tableId).empty();
                return;
            }
            
            var set = [];
            for (var i = 0; i < data.length; i++) {
                set.push({
                    Value: data[i]
                });
            };

            self.showValueTable(tableId, set, [{
                "title": "Value",
                "data": "Value"
            }]);
        };

        self.showHashSet = function(data) {
            var tableId = 'hashSetTable';
            if ((data == null || data.length == 0)) {
                $('#' + tableId).empty();
                return;
            }

            var hash = [];
            for (var i = 0; i < data.length; i++) {
                hash.push({
                    Name: data[i][0],
                    Value: data[i][1]
                });
            };

            self.showValueTable(tableId, hash, [{
                "title": "Name",
                "data": "Name"
            }, {
                "title": "Value",
                "data": "Value"
            }]);
        };

        self.showValueTable = function(elId, data, columns) {
            if (self.oValueTable != null) {
                self.oValueTable.destroy();
            }

            $('#' + elId).empty();
            self.oValueTable = $('#' + elId).DataTable({
                bFilter: false,
                bInfo: false,
                bPaginate: false,
                // scrollY: calcDataTableHeight(),
                //scrollCollapse: true,
                data: data,
                autoWidth: false,
                sDom: 'rt',
                columns: columns
            });
        };
    }
}