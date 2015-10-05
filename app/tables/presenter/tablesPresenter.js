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
            var headerHeight = 243 + $('#filterArea').height();
            return ($(window).height() - headerHeight);
        };

        $(window).unbind('resize');
        $(window).bind('resize', function() {
            $('.dataTables_scrollBody').css('height', calcDataTableHeight());
            if (self.oTable != null) {
                self.oTable.columns.adjust().draw();
            }
        });

        self.showEntities = function(data) {
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
                        return '<span style="display: block;overflow: hidden;white-space:nowrap;">' + (item == undefined ? '' : item._) + '</span>';
                    },
                });
            }
            if (self.oTable != null){
                self.oTable.clear();
                self.oTable.rows.add(data).draw();
            }
            else
                self.oTable = $('#tables').DataTable({
                    bFilter: false,
                    bInfo: false,
                    bPaginate: false,
                    scrollY: calcDataTableHeight(),
                    scrollX: true,
                    data: data,
                    autoWidth: true,
                    columns: columns
                });
        };
    };
}