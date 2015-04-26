exports.create = function (redisClientFactory, $redisSettings) {
    'use strict';

    return new function() {
        var self = this;
        self.oTable = null;
        self.Keys = null;
        var createTable = function() {
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
        };

        self.showKeys = function (data) {
            var client = redisClientFactory($redisSettings.Host, $redisSettings.Port, $redisSettings.Password);
            self.Keys = data;

            if (self.oTable) {
                self.oTable.destroy();
                createTable();
                return;
            }
            createTable();

            function format(value) {
                return '<textarea class="details-textarea">' + value + '</textarea>';
            }

            $('#data tbody').on('click', 'tr', function () {

                var tr = $(this).closest('tr');
                var row = self.oTable.row(tr);

                if (row.child.isShown()) {
                    // This row is already open - close it
                    row.child.hide();
                   // tr.removeClass('shown');
                } else {
                    // Open this row
                    client.get(row.data().Key, function (e, value) {
                        row.child(format(value)).show();
                      //  tr.addClass('shown');
                    });
                }
            });
        }
    }
}