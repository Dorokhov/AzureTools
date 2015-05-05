exports.create = function (redisClientFactory, $redisSettings) {
    'use strict';

    return new function () {
        var self = this;
        self.oTable = null;
        self.Keys = null;

        self.showKeys = function (data, updateCallback) {
            self.Keys = data;

            if (self.oTable) {
                self.oTable.destroy();
            }
            
            self.oTable = $('#data').DataTable({
                bFilter: false,
                bInfo: false,
                bPaginate: false,

                "data": self.Keys,
                "columns": [
                    {
                        "title": "Key",
                        "data": "Key"
                    },
                    {
                        "title": "Type",
                        "data": "Type",
                    },
                ]
            });

            function format(type, value) {
                var detailsClass = 'bigHeight';
                if (type === 'string') {
                    detailsClass = 'smallHeight';
                }
                return '<div>' +
                    '<textarea class="details-textarea ' + detailsClass + '">' + value + '</textarea>' +
                    '<button type="button" class="btn btn-default updateButton">Update</button>' +
                    '</div>';
            }

            // open/close details
            $('#data tbody').off('click', 'tr.even,tr.odd');
            $('#data tbody').on('click', 'tr.even,tr.odd', function () {
                var tr = $(this).closest('tr');
                var row = self.oTable.row(tr);

                if (row.child.isShown()) {
                    // This row is already open - close it
                    row.child.hide();
                    tr.removeClass('shown');
                } else {
                    // Open this row
                    row.child(format(row.data().Type, row.data().Value)).show();
                    tr.addClass('shown');
                }
            });

            // update value
            $('#data tbody').off('click', 'button.btn.btn-default.updateButton');
            $('#data tbody').on('click', 'button.btn.btn-default.updateButton', function () {
                var currentRow = $(this).closest('tr');
                var tr = currentRow.prev();
                var newValue = $(currentRow).find('textarea').val();
                var row = self.oTable.row(tr);
                updateCallback(row.data(), newValue);
            });
        }
    }
}