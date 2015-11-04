exports.create = function (redisClientFactory, $redisSettings) {
    'use strict';

    return new function () {
        var self = this;
        self.oTable = null;
        self.Keys = null;
        self.cleanUp = function() {
            if (self.oTable) {
                self.oTable.destroy();
            }

        };

        self.showKeys = function (data, onselect) {
            self.Keys = data;

            var calcDataTableHeight = function () {
                return ($(window).height() - 150);
            };

            self.cleanUp();

            $(window).unbind('resize');
            $(window).bind('resize',function () {
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
                columns: [
                    {
                        //"title": "Key",
                        "data": "Key"
                    }
                ],
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
    }
}