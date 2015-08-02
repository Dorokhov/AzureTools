exports.register = function (module) {
    module
        .controller('BlobsController', [
            '$scope',
            '$timeout',
            '$actionBarItems',
            '$busyIndicator',
            '$dialogViewModel',
            '$notifyViewModel',
            'blobsSettings',
            'azureStorage',
            'blobsPresenter',
            function (
                $scope,
                $timeout,
                $actionBarItems,
                $busyIndicator,
                $dialogViewModel,
                $notifyViewModel,
                blobsSettings,
                azureStorage,
                blobsPresenter) {

                $scope.BlobsViewModel = new function () {
                    var self = this;
                    var listContainersOperation = 'listContainersOperation';
                    var queryBlobsOperation = 'queryBlobsOperation';

                    var searchViewModel = {
                        search: function () {
                            if (!isConnectionSettingsSpecified()) {
                                return;
                            }

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

                    var containerSelectionViewModel = new function () {
                        this.Containers = null;
                        this.SelectedContainer = null;
                        this.onSelectedcontainerChanged = function () {
                            $notifyViewModel.close();
                            searchViewModel.search();
                        };
                    };

                    $busyIndicator.Text = 'Loading...';

                    // blobs action bar
                    $actionBarItems.ModuleName = ': Blobs';
                    $actionBarItems.IsTablesSelectVisible = true;
                    $actionBarItems.IsActionBarVisible = true;
                    $actionBarItems.IsRefreshVisible = true;
                    $actionBarItems.IsSettingsVisible = true;
                    $actionBarItems.IsSearchVisible = true;
                    $actionBarItems.refresh = function () {
                        if (!isConnectionSettingsSpecified()) {
                            return;
                        }

                        continuation = null;
                        entries = null;

                        if (tableSelectionViewModel.SelectedTable == null) {
                            loadTableList();
                        } else {
                            searchViewModel.search();
                        }
                    };
                    $actionBarItems.SearchViewModel = searchViewModel;
                    $actionBarItems.ContainerSelectViewModel = containerSelectionViewModel;
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
                                $dialogViewModel.BodyViewModel.AccountUrl = blobsSettings.AccountUrl;
                                $dialogViewModel.BodyViewModel.AccountName = blobsSettings.AccountName;
                                $dialogViewModel.BodyViewModel.AccountKey = blobsSettings.AccountKey;
                            }
                        };
                        $dialogViewModel.IsVisible = true;
                        $dialogViewModel.BodyViewModel = {
                            AccountUrl: blobsSettings.AccountUrl,
                            AccountName: blobsSettings.AccountName,
                            AccountKey: blobsSettings.AccountKey,
                        };

                        $dialogViewModel.Body = 'tablesSettingsTemplate';
                        $dialogViewModel.Header = 'Settings';
                        $dialogViewModel.save = function () {
                            //if ($validator.validatePort(+$dialogViewModel.BodyViewModel.Port) === false) {
                            //    showError('Port value is wrong. Port must be in range [1;65535]');
                            //    return;
                            //};

                            blobsSettings.AccountUrl = $dialogViewModel.BodyViewModel.AccountUrl;
                            blobsSettings.AccountName = $dialogViewModel.BodyViewModel.AccountName;
                            blobsSettings.AccountKey = $dialogViewModel.BodyViewModel.AccountKey;
                            $dialogViewModel.IsVisible = false;
                            loadTableList();
                        };
                    };

                    var isConnectionSettingsSpecified = function () {
                        return (blobsSettings.AccountUrl !== null && blobsSettings.AccountUrl !== '')
                            && (blobsSettings.AccountKey !== null && blobsSettings.AccountKey !== '')
                            && (blobsSettings.AccountName !== null && blobsSettings.AccountName !== '');
                    };

                    var showError = function (data) {
                        if (data !== undefined && data !== null) {
                            if (data.name && data.name === 'Error') {
                                $timeout(function () {
                                    $notifyViewModel.scope().$apply(function () {
                                        $notifyViewModel.showWarning(data.message);
                                    });
                                });
                            } else {
                                $timeout(function () {
                                    $notifyViewModel.scope().$apply(function () {
                                        $notifyViewModel.showWarning(data);
                                    });
                                });
                            }
                        }
                    };

                    var showInfo = function (msg) {
                        if (msg !== undefined && msg !== null) {
                            $timeout(function () {
                                $notifyViewModel.scope().$apply(function () {
                                    $notifyViewModel.showInfo(msg, 'Load More', function () {
                                        appendTableEntities(searchViewModel.Pattern);
                                    });
                                });
                            });
                        }
                    };

                    var defaultClient = null;
                    var defaultClientFactory = function () {
                        console.log(defaultClient);
                        if (defaultClient == null || (defaultClient.storageAccount !== blobsSettings.AccountName || defaultClient.storageAccessKey !== blobsSettings.AccountKey)) {
                            defaultClient = azureStorage.createBlobService(blobsSettings.AccountName, blobsSettings.AccountKey, blobsSettings.AccountUrl);
                        }
                        return defaultClient;
                    };

                    var cancelOperation = function () { };

                    var continuation = null;
                    var entries = null;
                    //var queryTableEntities = function (query) {
                    //    if ($busyIndicator.getIsBusy(queryEntitiesOperation) === false) {
                    //        var tableService = defaultClientFactory();
                    //        var cancelled = false;
                    //        $busyIndicator.setIsBusy(queryEntitiesOperation, true, function () { cancelled = true; });

                    //        var azureQuery = new azureStorage.TableQuery().where(query);

                    //        tableService.queryEntities(tableSelectionViewModel.SelectedTable, azureQuery, null, function (error, result, response) {
                    //            if (cancelled) return;
                    //            $busyIndicator.setIsBusy(queryEntitiesOperation, false, function () { cancelled = true; });
                    //            if (error) {
                    //                showError(error);
                    //            }

                    //            entries = result.entries;
                    //            if (result.continuationToken != null) {
                    //                showInfo('First ' + entries.length + ' entries loaded ');
                    //                continuation = result.continuationToken;
                    //            } else {
                    //                continuation = null;
                    //                $notifyViewModel.close();
                    //            }
                    //            blobsSettings.showEntities(result.entries);
                    //        });
                    //    }
                    //};

                    //var appendTableEntities = function (query) {
                    //    if ($busyIndicator.getIsBusy(queryEntitiesOperation) === false) {
                    //        var tableService = defaultClientFactory();
                    //        var cancelled = false;
                    //        $busyIndicator.setIsBusy(queryEntitiesOperation, true, function () { cancelled = true; });

                    //        var azureQuery = new azureStorage.TableQuery().where(query);

                    //        tableService.queryEntities(tableSelectionViewModel.SelectedTable, azureQuery, continuation, function (error, result, response) {
                    //            $busyIndicator.setIsBusy(queryEntitiesOperation, false, function () { cancelled = true; });
                    //            if (cancelled) return;
                    //            if (error) {
                    //                showError(error);
                    //            }

                    //            entries = entries.concat(result.entries);

                    //            blobsSettings.showEntities(entries);
                    //            if (result.continuationToken != null) {
                    //                showInfo('First ' + entries.length + ' entries loaded ');
                    //                continuation = result.continuationToken;
                    //            } else {
                    //                continuation = null;
                    //                $notifyViewModel.close();
                    //            }
                    //        });
                    //    }
                    //};
                    var containers = null;

                    var loadContainerList = function () {
                        if ($busyIndicator.getIsBusy(listContainersOperation) === false) {
                            var cancelled = false;
                            $busyIndicator.setIsBusy(listContainersOperation, true, function () { cancelled = true; });

                            var token = null;
                            defaultClientFactory().listContainersSegmented(token, null, function (error, data) {
                                if (cancelled) return;
                                $busyIndicator.setIsBusy(listContainersOperation, false, cancelOperation);
                                if (error) {
                                    showError(error);
                                }
                                console.log(data);
                                containerSelectionViewModel.Containers = data.entries;
                                if (containerSelectionViewModel.Containers != null && containerSelectionViewModel.Containers.length > 0) {
                                    containerSelectionViewModel.SelectedContainer = containerSelectionViewModel.Containers[0];
                                    blobsPresenter.showContainers(containerSelectionViewModel.Containers, function(containerResult) {
                                        $busyIndicator.setIsBusy(listContainersOperation, true, cancelOperation);
                                        defaultClientFactory().listBlobsSegmented(containerResult.name, null, function (e, d) {
                                            $busyIndicator.setIsBusy(listContainersOperation, false, cancelOperation);

                                            if (e) {
                                                showError(e);
                                            }

                                            blobsPresenter.showBlobs(d.entries, null,
                                                // load image
                                                function(selectedBlob, showBase64) {
                                                    var buffer = require('./../../node_modules/net-chromify/node_modules/buffer/index').Buffer;
                                                    var stream = defaultClientFactory().createReadStream(containerResult.name, selectedBlob.name);
                                                    var chunks = [];
                                                    stream.on('data', function(chunk) {chunks.push(chunk);});
                                                    stream.on('end', function() {
                                                        var result = buffer.concat(chunks);
                                                        var img = result.toString('base64');
                                                        showBase64(img);
                                                    });
                                                },
                                                // load text
                                                function(selectedBlob, showText) {
                                                    defaultClientFactory().getBlobToText(
                                                        containerResult.name,
                                                        selectedBlob.name,
                                                        function(ex, text) { showText(text); });
                                                });
                                        });
                                    }, function() {});
                                    // searchViewModel.search(); 
                                }
                            });
                        }
                    };

                    // init
                    loadContainerList();
                };
            }
        ]);
};