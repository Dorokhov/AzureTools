function proceed() {
    var $ = require('./node_modules/jquery/dist/jquery.js');
    var dataTable = require('./node_modules/datatables/media/js/jquery.dataTables.js');
    $.DataTable = dataTable;
    var redis = require("./node_modules/redis/index");
    var client = redis.createClient(6379, 'redisdor.redis.cache.windows.net', { auth_pass: 'ZaVlBh0AHJmw2r3PfWVKvm7X3FfC5fe+sMKJ93RueNY=' });

    client.keys('*', function(err, keys) {
            if (err) return console.log(err);


            var oTable = $('#data').DataTable({
                "data": [keys],
                "columns": [
                    { "title": "Key" },
                    { "title": "Value" }
                ]
            });

            function format(d) {
                return 'Full name: ' + d.first_name + ' ' + d.last_name + '<br>' +
                    'Salary: ' + d.salary + '<br>' +
                    'The child row can contain any data you wish, including links, images, inner tables etc.';
            }

            $('#data tbody').on('click', 'tr', function () {
               
                var tr = $(this).closest('tr');
                var row = oTable.row(tr);

                if (row.child.isShown()) {
                    // This row is already open - close it
                    row.child.hide();
                    tr.removeClass('shown');
                }
                else {
                    // Open this row
                    client.get(row.data(), function(e, value) {

                        row.child(value).show();
                        tr.addClass('shown');
                    });
                }
            });
        }
    );

}


document.addEventListener("DOMContentLoaded", function(event) {
    proceed();
});