exports.create = function() {
    'use strict';

    return new function() {
        var self = this;
        self.oTable = null;
        self.Keys = null;
        self.cleanUp = function() {
            if (self.oTable) {
                self.oTable.destroy(false);
            }

        };

        var calcDataTableHeight = function() {
            var headerHeight = 243 + $('#filterArea').height() + 42;
            return ($(window).height() - headerHeight);
        };

        $(window).unbind('resize');
        $(window).bind('resize', function() {
            $('.dataTables_scrollBody').css('height', calcDataTableHeight());
            if (self.oTable != null) {
                self.oTable.columns.adjust().draw();
            }
        });

        self.showEntities = function(data, onselect) {
            var columnsDictionary = {};
            for (var i = 0; i < data.length; i++) {
                for (var propertyName in data[i]) {
                    if (columnsDictionary[propertyName] == undefined) {
                        columnsDictionary[propertyName] = propertyName;
                    }
                }
            }

            var columns = [];
            for (var col in columnsDictionary) {
                columns.push({
                    title: col,
                    data: col,
                    render: function(item) {
                        return '<div style="white-space:nowrap;display: block;overflow: hidden;  display: -webkit-box; max-width: 500em;-webkit-line-clamp: 1;-webkit-box-orient: vertical;overflow: hidden; text-overflow: ellipsis;">' + (item == undefined ? '' : item._) + '</div>';
                    },
                });
            }

            if ((data == null || data.length == 0)) {
                $('#tables').empty();
                return;
            }

            if (self.oTable != null) {
                self.oTable.destroy();
            }

            $('#tables').empty();
            self.oTable = $('#tables').DataTable({
                bFilter: false,
                bInfo: false,
                //   bPaginate: false,
                lengthMenu: [100, 50, 1000],
                scrollY: calcDataTableHeight(),
                scrollX: true,
                data: data,
                autoWidth: true,
                deferRender: true,
                columns: columns,
                colReorder: {
                    realtime: false
                },
                //dom: 'Zlfrtip',
                dom: '<Zf<t>lip>',
                colResize: {
                    "tableWidthFixed": false
                },
                select: true

                //dom: 'C<"clear">lfrtip',
                //colVis: {
                //    restore: "Restore",
                //    showAll: "Show all",
                //    showNone: "Show none"
                //}
            });

            self.oTable.columns.adjust().draw();
            self.oTable.on('select', function(e,dt) {
                var rows = dt.rows( { selected: true } ).data();
                if(onselect) onselect(rows);
            });
        };
    };
}