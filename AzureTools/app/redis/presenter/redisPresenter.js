exports.create = function (redisClientFactory, $redisSettings) {
    'use strict';

    return new function () {
        var self = this;
        self.oTable = null;
        self.Keys = null;

        self.showKeys = function (data) {
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

            function format(value) {
                return '<textarea class="details-textarea">' + value + '</textarea>';
            }

            $('#data tbody').off('click', 'tr');
            $('#data tbody').on('click', 'tr', function () {

                var tr = $(this).closest('tr');
                var row = self.oTable.row(tr);

                if (row.child.isShown()) {
                    // This row is already open - close it
                    row.child.hide();
                    tr.removeClass('shown');
                } else {
                    // Open this row
                    row.child(format(row.data().Value)).show();
                    tr.addClass('shown');
                }
            });
        }
    }
}