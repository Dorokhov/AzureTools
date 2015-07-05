exports.register = function (module) {
    module
        .controller('TablesController', [
            '$scope',
            '$timeout',
            '$actionBarItems',
            '$busyIndicator',
            'tablesClient',
            'tablesPresenter',
            function (
                $scope,
                $timeout,
                $actionBarItems,
                $busyIndicator,
                tablesClient,
                tablesPresenter) {

                $scope.TablesViewModel = new function() {
                    var self = this;
                    var listTablesOperation = 'listTablesOperation';
                    var queryEntitiesOperation = 'queryEntitiesOperation';

                    var searchViewModel = {
                        search: function () {
                            queryTableEntities(this.Pattern);
                        },
                        Pattern: '',
                        clear: function () {
                            this.Pattern = '';
                            this.IsClearVisible = false;
                            searchViewModel.search();
                        },
                        IsClearVisible: false,
                        onChange: function () {
                            this.IsClearVisible = this.Pattern !== '';
                        }
                    };

                    // tables action bar
                    $actionBarItems.ModuleName = ': Tables';
                    $actionBarItems.IsActionBarVisible = true;
                    $actionBarItems.IsRefreshVisible = true;
                    $actionBarItems.IsSettingsVisible = true;
                    $actionBarItems.IsSearchVisible = true;
                    $actionBarItems.refresh = function () {
                        searchViewModel.search();
                    };
                    $actionBarItems.SearchViewModel = searchViewModel;

                    tablesClient.setDefaultClient({
                        accountUrl: 'http://dorphoenixtest.table.core.windows.net/',
                        accountName: 'dorphoenixtest',
                        accountKey: 'P7YnAD3x84bpwxV0abmguZBXJp7FTCEYj5SYlRPm5BJkf8KzGKEiD1VB1Kv21LGGxbUiLvmVvoChzCprFSWAbg=='
                    });
                    var defaultClient = tablesClient.getDefaultClient();


                    var queryTableEntities = function (query) {
                        $busyIndicator.setIsBusy(queryEntitiesOperation, true);
                        defaultClient.queryEntities(self.SelectedTable, { query: { _query: query } }, function (error, result, response) {
                            $busyIndicator.setIsBusy(queryEntitiesOperation, false);
                            if (error) {
                                console.log(error);
                            }

                            console.log(result);

                            tablesPresenter.showEntities(result);
                        });
                    }
                    //defaultClient.createTable('tableName2', true, function(e) {
                    //    console.log('SMth'+e);
                    //});

                    self.Tables = [];
                    self.SelectedTable = null;

                    //on selected table changed
                    self.onSelectedTableChanged = function () {
                        searchViewModel.search();
                    }

                    $busyIndicator.setIsBusy(listTablesOperation, true);
                    defaultClient.listTables(function (err, data) {
                        $busyIndicator.setIsBusy(listTablesOperation, false);

                        console.log(err);
                        console.log(data);

                        var viewModel = data.map(function (el) {
                            return {
                                Name: el
                            };
                        });

                        self.Tables = data;
                        //tablesPresenter.showTables(viewModel, function (data) {
                        //    self.SelectedTable = data.Name;
                        //    onSelectedTableChanged();
                        //});
                    });
                }
            }
        ]);
};