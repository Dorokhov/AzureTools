exports.create = function () {
    'use strict';

    return new function () {
        var self = this;
        self.oTable = null;
        self.Keys = null;
        self.cleanUp = function () {
            if (self.oTable) {
                self.oTable.destroy(false);
            }

        };

        var calcDataTableHeight = function () {
            var headerHeight = $('nav[role="navigation"]').height() + 52 + 20 + 5;
            return ($(window).height() - headerHeight);
        };

        self.showTables = function (data, onSelect, removeCallback) {
            self.Data = data;


            self.cleanUp();

            $(window).unbind('resize');
            $(window).bind('resize', function () {
                $('.dataTables_scrollBody').css('height', calcDataTableHeight());
                self.oTable.columns.adjust().draw();
            });

            self.oTable = $('#tables').DataTable({
                bFilter: false,
                bInfo: false,
                bPaginate: false,
                scrollY: calcDataTableHeight(),
                scrollX: true,
                //scrollCollapse: true,
                data: self.Data,
                autoWidth: true,
                columns: [
                    {
                        "title": "Table",
                        "data": "Name"
                    },
                    //{
                    //    "title": "Type",
                    //    "data": "Type",
                    //},
                    {
                        "title": "",
                        "render": function () {
                            return '<a class="remove" style="color:black; cursor:pointer;" placeholder="Delete"><span class="icon-remove"></span></a>';
                        },
                    },
                ]
            });

            function format(type, value) {
                return '<div>' +
                    '<textarea class="details-textarea">' + value + '</textarea>' +
                    '<button type="button" class="btn btn-default updateButton">Update</button>' +
                    '</div>';
            }

            // open/close details
            $('#tables tbody').off('click', 'tr.even,tr.odd');
            $('#tables tbody').on('click', 'tr.even,tr.odd', function () {
                var tr = $(this).closest('tr');
                var row = self.oTable.row(tr);
                onSelect(row.data());
            });

            // handle update
            $('#tables tbody').off('click', 'button.btn.btn-default.updateButton');
            $('#tables tbody').on('click', 'button.btn.btn-default.updateButton', function () {
                var currentRow = $(this).closest('tr');
                var tr = currentRow.prev();
                var newValue = $(currentRow).find('textarea').val();
                var row = self.oTable.row(tr);
                updateCallback(row.data(), newValue);
            });

            // handle remove 
            $('#tables tbody').off('click', 'a.remove');
            $('#tables tbody').on('click', 'a.remove', function (event) {
                var tr = $(this).closest('tr');
                var row = self.oTable.row(tr);
                removeCallback(row.data());
                return false;
            });
        }

        self.showEntities = function (data) {

            self.cleanUp();
            $('#tables').empty();

            $(window).unbind('resize');
            $(window).bind('resize', function () {
                $('.dataTables_scrollBody').css('height', calcDataTableHeight());
                self.oTable.columns.adjust().draw();
            });

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
                    render: function (data) {
                        return '<span style="display: block;overflow: hidden;white-space:nowrap;">' + (data == undefined ? '' : data._) + '</span>';
                    },
                });
            }

            self.oTable = $('#tables').DataTable({
                bFilter: false,
                bInfo: false,
                bPaginate: false,
                scrollY: calcDataTableHeight(),
                scrollX: true,
                data: data,
                autoWidth: false,
                columns: columns
            });
        }
    }
}