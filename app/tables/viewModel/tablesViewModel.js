exports.register = function(module) {
    module
        .controller('TablesController', [
            '$scope',
            '$timeout',
            '$actionBarItems',
            '$busyIndicator',
            '$dialogViewModel',
            '$notifyViewModel',
            'tablesSettings',
            'azureStorage',
            'tablesPresenter',
            function(
                $scope,
                $timeout,
                $actionBarItems,
                $busyIndicator,
                $dialogViewModel,
                $notifyViewModel,
                tablesSettings,
                azureStorage,
                tablesPresenter) {
                $scope.TablesViewModel = new function() {
                    var self = this;
                    var listTablesOperation = 'listTablesOperation';
                    var queryEntitiesOperation = 'queryEntitiesOperation';

                    var searchViewModel = {
                        search: function() {
                            if (!isConnectionSettingsSpecified()) {
                                return;
                            }

                            queryTableEntities(this.Pattern);
                        },
                        Pattern: '',
                        clear: function() {
                            this.Pattern = '';
                            this.IsClearVisible = false;
                            searchViewModel.search();
                        },
                        IsClearVisible: false,
                        onChange: function() {
                            this.IsClearVisible = this.Pattern !== '';
                        }
                    };

                    var tableSelectionViewModel = new function() {
                        this.Tables = null;
                        this.SelectedTable = null;
                        this.onSelectedTableChanged = function(selectedTable) {
                            this.SelectedTable = selectedTable;
                            $notifyViewModel.close();
                            searchViewModel.search();
                        };
                    };

                    $busyIndicator.Text = 'Loading...';

                    // tables action bar
                    self.Settings = tablesSettings;

                    $actionBarItems.ModuleName = ': Tables';
                    $actionBarItems.IsTablesSelectVisible = true;
                    $actionBarItems.IsActionBarVisible = true;
                    $actionBarItems.IsRefreshVisible = true;
                    $actionBarItems.IsSettingsVisible = true;
                    $actionBarItems.IsSearchVisible = true;
                    $actionBarItems.refresh = function() {
                        if (!isConnectionSettingsSpecified()) {
                            return;
                        }

                        $actionBarItems.Continuation = null;
                        entries = null;

                        if (tableSelectionViewModel.SelectedTable == null) {
                            loadTableList();
                        } else {
                            searchViewModel.search();
                        }
                    };
                    $actionBarItems.Continuation = null;
                    $actionBarItems.loadMore = function() {
                        appendTableEntities(searchViewModel.Pattern);
                    };
                    $actionBarItems.SearchViewModel = searchViewModel;
                    self.TableSelectViewModel = tableSelectionViewModel;
                    $actionBarItems.changeSettings = function() {
                        $dialogViewModel.WithOption = true;
                        $dialogViewModel.OptionText = 'Use demo credentials';
                        $dialogViewModel.IsChecked = false;
                        $dialogViewModel.onChecked = function() {
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
                        };

                        $dialogViewModel.Body = 'tablesSettingsTemplate';
                        $dialogViewModel.Header = 'Settings';
                        $dialogViewModel.save = function() {
                            tablesSettings.AccountUrl = $dialogViewModel.BodyViewModel.AccountUrl;
                            tablesSettings.AccountName = $dialogViewModel.BodyViewModel.AccountName;
                            tablesSettings.AccountKey = $dialogViewModel.BodyViewModel.AccountKey;
                            $dialogViewModel.IsVisible = false;
                            loadTableList();
                        };
                    };

                    var isConnectionSettingsSpecified = function() {
                        return (tablesSettings.AccountUrl !== null && tablesSettings.AccountUrl !== '') && (tablesSettings.AccountKey !== null && tablesSettings.AccountKey !== '') && (tablesSettings.AccountName !== null && tablesSettings.AccountName !== '');
                    };

                    var showError = function(data) {
                        if (data !== undefined && data !== null) {
                            if (data.name && data.name === 'Error') {
                                $timeout(function() {
                                    $notifyViewModel.scope().$apply(function() {
                                        $notifyViewModel.showWarning(data.message);
                                    });
                                });
                            } else {
                                $timeout(function() {
                                    $notifyViewModel.scope().$apply(function() {
                                        $notifyViewModel.showWarning(data);
                                    });
                                });
                            }
                        }
                    };

                    var defaultClient = null;
                    var defaultClientFactory = function() {
                        console.log(defaultClient);
                        if (defaultClient == null || (defaultClient.storageAccount !== tablesSettings.AccountName || defaultClient.storageAccessKey !== tablesSettings.AccountKey)) {
                            defaultClient = azureStorage.createTableService(tablesSettings.AccountName, tablesSettings.AccountKey, tablesSettings.AccountUrl);
                        }
                        return defaultClient;
                    };

                    var cancelOperation = function() {};

                    var entries = null;
                    var queryTableEntities = function(query) {
                        if ($busyIndicator.getIsBusy(queryEntitiesOperation) === false) {
                            var tableService = defaultClientFactory();
                            var cancelled = false;
                            $busyIndicator.setIsBusy(queryEntitiesOperation, true, function() {
                                cancelled = true;
                            });

                            var azureQuery = new azureStorage.TableQuery().where(query);

                            tableService.queryEntities(tableSelectionViewModel.SelectedTable, azureQuery, null, function(error, result, response) {
                                if (cancelled) return;
                                $busyIndicator.setIsBusy(queryEntitiesOperation, false, function() {
                                    cancelled = true;
                                });
                                if (error) {
                                    showError(error);
                                }

                                entries = result.entries;
                                console.log('entries:' + entries.length);
                                if (result.continuationToken != null) {
                                    //showInfo('First ' + entries.length + ' entries loaded ');
                                    $actionBarItems.Continuation = result.continuationToken;
                                } else {
                                    $actionBarItems.Continuation = null;
                                    $notifyViewModel.close();
                                }

                                tablesPresenter.showEntities(result.entries);
                            });
                        }
                    };

                    var appendTableEntities = function(query) {
                        if ($busyIndicator.getIsBusy(queryEntitiesOperation) === false) {
                            var tableService = defaultClientFactory();
                            var cancelled = false;
                            $busyIndicator.setIsBusy(queryEntitiesOperation, true, function() {
                                cancelled = true;
                            });

                            var azureQuery = new azureStorage.TableQuery().where(query);

                            tableService.queryEntities(tableSelectionViewModel.SelectedTable, azureQuery,  $actionBarItems.Continuation, function(error, result, response) {
                                $busyIndicator.setIsBusy(queryEntitiesOperation, false, function() {
                                    cancelled = true;
                                });
                                if (cancelled) return;
                                if (error) {
                                    showError(error);
                                }

                                entries = entries.concat(result.entries);

                                tablesPresenter.showEntities(entries);
                                if (result.continuationToken != null) {
                                    //showInfo('First ' + entries.length + ' entries loaded ');
                                    $actionBarItems.Continuation = result.continuationToken;
                                } else {
                                    $actionBarItems.Continuation = null;
                                    $notifyViewModel.close();
                                }
                            });
                        }
                    };

                    var loadTableList = function() {
                        if ($busyIndicator.getIsBusy(listTablesOperation) === false) {
                            var cancelled = false;
                            $busyIndicator.setIsBusy(listTablesOperation, true, function() {
                                cancelled = true;
                            });
                            defaultClientFactory().listTablesSegmented(null, null, function(error, data) {
                                console.log('Tables Loaded')
                                if (cancelled) return;
                                $busyIndicator.setIsBusy(listTablesOperation, false, cancelOperation);
                                if (error) {
                                    showError(error);
                                }

                                tableSelectionViewModel.Tables = data.entries;
                                if (tableSelectionViewModel.Tables != null && tableSelectionViewModel.Tables.length > 0) {
                                    tableSelectionViewModel.SelectedTable = tableSelectionViewModel.Tables[0];
                                    searchViewModel.search();
                                }
                            });
                        }
                    };

                    // init
                    $actionBarItems.changeSettings();
                    //if (tablesSettings.isEmpty()) {
                    //$actionBarItems.changeSettings();
                    //  } else {
                    //     loadTableList();
                    //  }
                };
            }
        ]);
};