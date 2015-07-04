exports.register = function (module) {
    module
        .controller('TablesController', [
            '$scope',
            '$timeout',
            'tablesClient',
            'tablesPresenter',
            function (
                $scope,
                $timeout,
                tablesClient,
                tablesPresenter) {

                tablesClient.setDefaultClient({
                    accountUrl: 'http://dorphoenixtest.table.core.windows.net/',
                    accountName: 'dorphoenixtest',
                    accountKey: 'P7YnAD3x84bpwxV0abmguZBXJp7FTCEYj5SYlRPm5BJkf8KzGKEiD1VB1Kv21LGGxbUiLvmVvoChzCprFSWAbg=='
                });

                var defaultClient = tablesClient.getDefaultClient();
                //defaultClient.createTable('tableName2', true, function(e) {
                //    console.log('SMth'+e);
                //});


                defaultClient.listTables(function (err, data) {
                    console.log(err);
                    console.log(data);

                    var viewModel = data.map(function(el) {
                        return {
                            Name: el
                    }; });

                    tablesPresenter.showTables(viewModel );
                });
            }
        ]);
};