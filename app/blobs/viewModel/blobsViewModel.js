exports.register = function(module) {
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
            'bufferFactory',
            function(
                $scope,
                $timeout,
                $actionBarItems,
                $busyIndicator,
                $dialogViewModel,
                $notifyViewModel,
                blobsSettings,
                azureStorage,
                blobsPresenter,
                bufferFactory) {

                var self = this;
                var listContainersOperation = 'listContainersOperation';
                var queryBlobsOperation = 'queryBlobsOperation';
                var loadBlobOperation = 'loadBlobOperation';

                $scope.containerOptions = {
                    enableSorting: true,
                    columnDefs: [{
                        name: 'Name',
                        field: 'name',
                        width: '*'
                    }],
                    data: null,
                    enableRowSelection: true,
                    enableSelectAll: false,
                    enableFullRowSelection: true,
                    enableRowHeaderSelection: false,
                    multiSelect: false,
                    enableColumnMenus: false,
                    selectedContainer: null,
                    onRegisterApi: function(gridApi) {
                        $scope.containerApi = gridApi;
                        $scope.containerApi.selection.on.rowSelectionChanged($scope, function(row) {
                            $scope.containerOptions.selectedContainer = row.entity;
                            $scope.blobOptions.selectedBlob = null;
                            loadBlobs($scope.containerOptions.selectedContainer);
                        });
                    },
                    getStyle: function() {
                        return {
                            height: '100%'
                        };
                    }
                };

                $scope.blobOptions = {
                    enableSorting: true,
                    columnDefs: [{
                        name: 'Name',
                        field: 'name',
                        width: '*'
                    }],
                    data: null,
                    enableRowSelection: true,
                    enableSelectAll: false,
                    enableFullRowSelection: true,
                    enableRowHeaderSelection: false,
                    multiSelect: false,
                    enableColumnMenus: false,
                    selectedBlob: null,
                    onRegisterApi: function(gridApi) {
                        $scope.blobApi = gridApi;
                        $scope.blobApi.selection.on.rowSelectionChanged($scope, function(row) {
                            $scope.blobOptions.selectedBlob = row.entity;
                        });
                    },
                    getStyle: function() {
                        return {
                            height: '100%'
                        };
                    }
                };


                var searchViewModel = {
                    search: function() {
                        if (!isConnectionSettingsSpecified()) {
                            return;
                        }

                        loadBlobs($scope.containerOptions.selectedContainer, this.Pattern);
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

                $busyIndicator.Text = 'Loading...';

                // blobs action bar
                $actionBarItems.ModuleName = ': Blobs';
                $actionBarItems.IsActionBarVisible = true;
                $actionBarItems.IsRefreshVisible = true;
                $actionBarItems.IsSettingsVisible = true;
                $actionBarItems.IsSearchVisible = true;
                $actionBarItems.refresh = function() {
                    if (!isConnectionSettingsSpecified()) {
                        return;
                    }

                    continuation = null;
                    entries = null;

                    if ($scope.containerOptions.selectedContainer == null) {
                        loadContainerList();
                    } else {
                        searchViewModel.search();
                    }
                };
                $actionBarItems.SearchViewModel = searchViewModel;
                $actionBarItems.changeSettings = function() {
                    var changeSettingsDialog = $dialogViewModel();
                    changeSettingsDialog.AreButtonsDisabled = false;
                    changeSettingsDialog.WithOption = true;
                    changeSettingsDialog.OptionText = 'Use demo credentials';
                    changeSettingsDialog.IsChecked = false;
                    changeSettingsDialog.onChecked = function() {
                        if (changeSettingsDialog.IsChecked) {
                            changeSettingsDialog.BodyViewModel.AccountUrl = 'http://dorphoenixtest.blob.core.windows.net/';
                            changeSettingsDialog.BodyViewModel.AccountName = 'dorphoenixtest';
                            changeSettingsDialog.BodyViewModel.AccountKey = 'P7YnAD3x84bpwxV0abmguZBXJp7FTCEYj5SYlRPm5BJkf8KzGKEiD1VB1Kv21LGGxbUiLvmVvoChzCprFSWAbg==';
                        } else {
                            changeSettingsDialog.BodyViewModel.AccountUrl = blobsSettings.AccountUrl;
                            changeSettingsDialog.BodyViewModel.AccountName = blobsSettings.AccountName;
                            changeSettingsDialog.BodyViewModel.AccountKey = blobsSettings.AccountKey;
                        }
                    };
                    changeSettingsDialog.IsVisible = true;
                    changeSettingsDialog.BodyViewModel = {
                        AccountUrl: blobsSettings.AccountUrl,
                        AccountName: blobsSettings.AccountName,
                        AccountKey: blobsSettings.AccountKey,
                    };

                    changeSettingsDialog.Body = 'blobsSettingsTemplate';
                    changeSettingsDialog.Header = 'Settings';
                    changeSettingsDialog.save = function() {
                        blobsSettings.AccountUrl = changeSettingsDialog.BodyViewModel.AccountUrl;
                        blobsSettings.AccountName = changeSettingsDialog.BodyViewModel.AccountName;
                        blobsSettings.AccountKey = changeSettingsDialog.BodyViewModel.AccountKey;
                        changeSettingsDialog.IsVisible = false;
                        loadContainerList();
                    };
                };
                $actionBarItems.blobsViewModel = $scope;

                var isConnectionSettingsSpecified = function() {
                    return (blobsSettings.AccountUrl !== null && blobsSettings.AccountUrl !== '') && (blobsSettings.AccountKey !== null && blobsSettings.AccountKey !== '') && (blobsSettings.AccountName !== null && blobsSettings.AccountName !== '');
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

                var showBlob = function(blob, data, template) {
                    var previewDialog = $dialogViewModel();
                    previewDialog.AreButtonsDisabled = false;
                    previewDialog.IsVisible = true;
                    previewDialog.IsSaveVisible = false;
                    previewDialog.BodyViewModel = {
                        source: data
                    };

                    previewDialog.Body = template;
                    previewDialog.Header = blob.name;
                }

                var defaultClient = null;
                var defaultClientFactory = function() {
                    console.log(defaultClient);
                    if (defaultClient == null || (defaultClient.storageAccount !== blobsSettings.AccountName || defaultClient.storageAccessKey !== blobsSettings.AccountKey)) {
                        defaultClient = azureStorage.createBlobService(blobsSettings.AccountName, blobsSettings.AccountKey, blobsSettings.AccountUrl);
                        console.log(defaultClient);
                    }
                    return defaultClient;
                };

                var cancelOperation = function() {};

                var continuation = null;
                var entries = null;

                $scope.showImage = function() {
                    if ($busyIndicator.getIsBusy(loadBlobOperation) === false) {
                        $busyIndicator.setIsBusy(loadBlobOperation, true, cancelOperation);

                        var selectedBlob = $scope.blobOptions.selectedBlob;
                        var selectedContainer = $scope.containerOptions.selectedContainer;

                        var buffer = bufferFactory.Buffer;
                        var stream = defaultClientFactory().createReadStream(selectedContainer.name, selectedBlob.name);
                        var chunks = [];
                        stream.on('data', function(chunk) {
                            chunks.push(chunk);
                        });
                        stream.on('end', function() {
                            $busyIndicator.setIsBusy(loadBlobOperation, false, cancelOperation);

                            var result = buffer.concat(chunks);
                            var img = result.toString('base64');
                            showBlob(selectedBlob, img, 'blobImage');
                        });
                    }
                };

                $scope.showText = function() {
                    if ($busyIndicator.getIsBusy(loadBlobOperation) === false) {
                        $busyIndicator.setIsBusy(loadBlobOperation, true, cancelOperation);

                        var selectedBlob = $scope.blobOptions.selectedBlob;
                        var selectedContainer = $scope.containerOptions.selectedContainer;

                        defaultClientFactory().getBlobToText(
                            selectedContainer.name,
                            selectedBlob.name,
                            function(ex, text) {
                                $busyIndicator.setIsBusy(loadBlobOperation, false, cancelOperation);
                                showBlob(selectedBlob, text, 'blobText');
                            });
                    }
                };

                var downloadBytes = function(bytes, blob) {
                    chrome.fileSystem.chooseEntry({
                            type: 'saveFile',
                            suggestedName: blob.name
                        },
                        function(writableFileEntry) {
                            writableFileEntry.createWriter(function(writer) {
                                writer.onwriteend = function(e) {

                                };

                                writer.write(new Blob(bytes, {
                                    type: 'text/plain'
                                }));
                            }, function(e) {
                                console.log(e);
                            });
                        });
                };
                $scope.download = function() {
                    if ($busyIndicator.getIsBusy(loadBlobOperation) === false) {
                        $busyIndicator.setIsBusy(loadBlobOperation, true, cancelOperation);

                        var selectedBlob = $scope.blobOptions.selectedBlob;
                        var selectedContainer = $scope.containerOptions.selectedContainer;

                        var buffer = bufferFactory.Buffer;
                        var stream = defaultClientFactory().createReadStream(selectedContainer.name, selectedBlob.name);
                        var chunks = [];
                        stream.on('data', function(chunk) {
                            chunks.push(chunk);
                        });
                        stream.on('end', function() {
                            $busyIndicator.setIsBusy(loadBlobOperation, false, cancelOperation);
                            var result = buffer.concat(chunks);
                            downloadBytes([result.buffer], selectedBlob);
                        });
                    }
                };

                var loadBlobs = function(containerResult, pattern) {
                    if (containerResult == null) return;
                    $notifyViewModel.close();
                    $busyIndicator.setIsBusy(listContainersOperation, true, cancelOperation);
                    var proceedBlobs = function(e, d) {
                        $busyIndicator.setIsBusy(listContainersOperation, false, cancelOperation);

                        if (e) {
                            showError(e);
                        }

                        $scope.blobOptions.data = d.entries;
                    };

                    if (pattern == null) {
                        defaultClientFactory().listBlobsSegmented(containerResult.name, null, proceedBlobs);
                    } else {
                        defaultClientFactory().listBlobsSegmentedWithPrefix(containerResult.name, pattern, null, proceedBlobs);
                    }
                };

                var loadContainerList = function() {
                    $notifyViewModel.close();
                    if ($busyIndicator.getIsBusy(listContainersOperation) === false) {
                        var cancelled = false;
                        $busyIndicator.setIsBusy(listContainersOperation, true, function() {
                            cancelled = true;
                        });

                        var token = null;
                        var containers = [];
                        var containersLoadedCb = function(error, data) {
                            if (cancelled) return;
                            if (error) {
                                $busyIndicator.setIsBusy(listContainersOperation, false, cancelOperation);
                                showError(error);
                            }

                            containers = containers.concat(data.entries);

                            if (data.continuationToken != null) {
                                token = data.continuationToken;
                                defaultClientFactory().listContainersSegmented(token, null, containersLoadedCb);
                                return;
                            }

                            $busyIndicator.setIsBusy(listContainersOperation, false, cancelOperation);

                            $scope.containerOptions.data = containers;
                            $scope.blobOptions.selectedBlob = null;
                        };

                        defaultClientFactory().listContainersSegmented(token, containersLoadedCb);
                    }
                };

                // init
                if (blobsSettings.isEmpty()) {
                    $actionBarItems.changeSettings();
                } else {
                    loadContainerList();
                }
            }
        ]);
};