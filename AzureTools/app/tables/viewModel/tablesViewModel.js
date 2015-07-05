exports.register = function (module) {
    module
        .controller('TablesController', [
            '$scope',
            '$timeout',
            '$actionBarItems',
            '$busyIndicator',
            '$dialogViewModel',
            'tablesSettings',
            'azureStorage',
            'tablesPresenter',
            function (
                $scope,
                $timeout,
                $actionBarItems,
                $busyIndicator,
                $dialogViewModel,
                tablesSettings,
                azureStorage,
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

                    var tableSelectionViewModel = new function() {
                        var self = this;
                        self.Tables = null;
                        self.SelectedTable = null;
                        self.onSelectedTableChanged = function() {
                            searchViewModel.search();
                        }
                    };

                    // tables action bar
                    $actionBarItems.ModuleName = ': Tables';
                    $actionBarItems.IsTablesSelectVisible = true;
                    $actionBarItems.IsActionBarVisible = true;
                    $actionBarItems.IsRefreshVisible = true;
                    $actionBarItems.IsSettingsVisible = true;
                    $actionBarItems.IsSearchVisible = true;
                    $actionBarItems.refresh = function () {
                        searchViewModel.search();
                    };
                    $actionBarItems.SearchViewModel = searchViewModel;
                    $actionBarItems.TableSelectViewModel = tableSelectionViewModel;
                    $actionBarItems.changeSettings = function () {
                        $dialogViewModel.WithOption = true;
                        $dialogViewModel.OptionText = 'Use demo credentials';
                        $dialogViewModel.IsChecked = false;
                        $dialogViewModel.onChecked = function () {
                            if ($dialogViewModel.IsChecked) {
                                $dialogViewModel.BodyViewModel.AccountUrl = 'http://dorphoenixtest.table.core.windows.net/';
                                $dialogViewModel.BodyViewModel.AccountName = 'dorphoenixtest';
                                $dialogViewModel.BodyViewModel.AccountKey = 'P7YnAD3x84bpwxV0abmguZBXJp7FTCEYj5SYlRPm5BJkf8KzGKEiD1VB1Kv21LGGxbUiLvmVvoChzCprFSWAbg==';
                            } else {
                                $dialogViewModel.BodyViewModel.AccountUrl = tablesSettings.AccountUrl;
                                $dialogViewModel.BodyViewModel.AccountName = tablesSettings.AccountName;
                                $dialogViewModel.BodyViewModel.AccountKey = tablesSettings.AccountKey;
                            }
                        };
                        $dialogViewModel.IsVisible = true;
                        $dialogViewModel.BodyViewModel = {
                            AccountUrl: tablesSettings.AccountUrl,
                            AccountName: tablesSettings.AccountName,
                            AccountKey: tablesSettings.AccountKey,
                        }
                        $dialogViewModel.Body = 'tablesSettingsTemplate';
                        $dialogViewModel.Header = 'Settings';
                        $dialogViewModel.save = function () {
                            //if ($validator.validatePort(+$dialogViewModel.BodyViewModel.Port) === false) {
                            //    showError('Port value is wrong. Port must be in range [1;65535]');
                            //    return;
                            //};

                            tablesSettings.AccountUrl = $dialogViewModel.BodyViewModel.AccountUrl;
                            tablesSettings.AccountName = $dialogViewModel.BodyViewModel.AccountName;
                            tablesSettings.AccountKey = $dialogViewModel.BodyViewModel.AccountKey;
                            $dialogViewModel.IsVisible = false;
                            loadTableList();
                        };
                    };

                    var defaultClient = null;
                    var defaultClientFactory = function () {
                        if (defaultClient == null) {
                            defaultClient = azureStorage.createTableService(tablesSettings.AccountName, tablesSettings.AccountKey, tablesSettings.AccountUrl);
                        }
                        //defaultClient = tablesClient.setDefaultClient({
                        //    accountUrl: tablesSettings.AccountUrl,
                        //    accountName: tablesSettings.AccountName,
                        //    accountKey: tablesSettings.AccountKey
                        //});

                        //defaultClient._currRequest
                        return defaultClient;
                    }
                    var queryTableEntities = function (query) {
                        $busyIndicator.setIsBusy(queryEntitiesOperation, true);

                        var tableService = defaultClientFactory();
                        var azureQuery = new azureStorage.TableQuery().where(query);

                        tableService.queryEntities(tableSelectionViewModel.SelectedTable, azureQuery, null, function (error, result, response) {
                            $busyIndicator.setIsBusy(queryEntitiesOperation, false);
                            if (error) {
                                console.log(error);
                            }

                            console.log(result);

                            tablesPresenter.showEntities(result.entries);
                        });
                    }

                    var loadTableList = function() {
                        $busyIndicator.setIsBusy(listTablesOperation, true);
                        defaultClientFactory().listTablesSegmented(null,null,function (err, data) {
                            $busyIndicator.setIsBusy(listTablesOperation, false);

                            console.log(err);
                            console.log(data);


                            tableSelectionViewModel.Tables = data.entries;
                            //tablesPresenter.showTables(viewModel, function (data) {
                            //    self.SelectedTable = data.Name;
                            //    onSelectedTableChanged();
                            //});
                        });
                    };
                    //defaultClient.createTable('tableName2', true, function(e) {
                    //    console.log('SMth'+e);
                    //});
                    
                    // init
                    if (tablesSettings.isEmpty()) {
                        $actionBarItems.changeSettings();
                    } else {
                        loadTableList();
                    }
                }
            }
        ]);
};