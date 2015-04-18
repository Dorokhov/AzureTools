(function () {
    var angular = require('./node_modules/angular/index.js');
    var angularRoute = require('./node_modules/angular-ui-router/release/angular-ui-router.js');

    angular.RedisController = function() {
        var $ = require('./node_modules/jquery/dist/jquery.js');
        var dataTable = require('./node_modules/datatables/media/js/jquery.dataTables.js');
        $.DataTable = dataTable;
        var client =
            require('./redis/model/redisClientFactory.js').createClient();
           // require('./redis/model/redisClientFactoryMock.js').createClient();

        client.keys('*', function(err, keys) {
                if (err) return console.log(err);

                var oTable = $('#data').DataTable({
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
            }
        );
    };



    angular
        .module('redis', [angularRoute])
        .config(function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('redis', {
                    url: "",
                    templateUrl: "redis/view/index.html",
                    controller: function ($scope) {
                        angular.RedisController();
                    }
                });
        });
})();