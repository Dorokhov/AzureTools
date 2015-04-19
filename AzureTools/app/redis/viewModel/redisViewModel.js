exports.create = function (redisClientFactory, dataTablePresenter) {
    return new function() {
        var self = this;

        self.Host = 'redisdor.redis.cache.windows.net';
        self.Port = 6379;
        self.Password = 'ZaVlBh0AHJmw2r3PfWVKvm7X3FfC5fe+sMKJ93RueNY=';

        var client = redisClientFactory(self.Host, self.Port, self.Password);
        client.keys('*', function(err, keys) {
            if (err) {
                console.log(err);
            }

            var oTable = $('#data').DataTable({
                bFilter: false,
                bInfo: false,
                bPaginate: false,

                "data": keys,
                "columns": [
                    { "title": "Key" },
                ]
            });

            function format(d) {
                return 'Full name: ' + d.first_name + ' ' + d.last_name + '<br>' +
                    'Salary: ' + d.salary + '<br>' +
                    'The child row can contain any data you wish, including links, images, inner tables etc.';
            }

            $('#data tbody').on('click', 'tr', function() {

                var tr = $(this).closest('tr');
                var row = oTable.row(tr);

                if (row.child.isShown()) {
                    // This row is already open - close it
                    row.child.hide();
                    tr.removeClass('shown');
                } else {
                    // Open this row
                    client.get(row.data(), function(e, value) {
                        row.child(value).show();
                        tr.addClass('shown');
                    });
                }
            });
        });
    }
}