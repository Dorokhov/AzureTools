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
            'bufferFactory',
            function (
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

                $scope.BlobsViewModel = new function () {
                    var self = this;
                    var listContainersOperation = 'listContainersOperation';
                    var queryBlobsOperation = 'queryBlobsOperation';
                    var loadBlobOperation = 'loadBlobOperation';

                    var searchViewModel = {
                        search: function () {
                            if (!isConnectionSettingsSpecified()) {
                                return;
                            }

                            loadBlobs(containerSelectionViewModel.SelectedContainer, this.Pattern);
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

                        if (containerSelectionViewModel.SelectedContainer == null) {
                            loadContainerList();
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
                                $dialogViewModel.BodyViewModel.AccountUrl = 'http://dorphoenixtest.blob.core.windows.net/';
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

                        $dialogViewModel.Body = 'blobsSettingsTemplate';
                        $dialogViewModel.Header = 'Settings';
                        $dialogViewModel.save = function () {
                            blobsSettings.AccountUrl = $dialogViewModel.BodyViewModel.AccountUrl;
                            blobsSettings.AccountName = $dialogViewModel.BodyViewModel.AccountName;
                            blobsSettings.AccountKey = $dialogViewModel.BodyViewModel.AccountKey;
                            $dialogViewModel.IsVisible = false;
                            loadContainerList();
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

                    var defaultClient = null;
                    var defaultClientFactory = function () {
                        console.log(defaultClient);
                        if (defaultClient == null || (defaultClient.storageAccount !== blobsSettings.AccountName || defaultClient.storageAccessKey !== blobsSettings.AccountKey)) {
                            defaultClient = azureStorage.createBlobService(blobsSettings.AccountName, blobsSettings.AccountKey, blobsSettings.AccountUrl);
                            console.log(defaultClient);
                        }
                        return defaultClient;
                    };

                    var cancelOperation = function () { };

                    var continuation = null;
                    var entries = null;

                    var loadBlobs = function (containerResult, pattern) {
                        if (containerResult == null) return;
                        $notifyViewModel.close();
                        $busyIndicator.setIsBusy(listContainersOperation, true, cancelOperation);
                        var proceedBlobs = function(e, d) {
                            $busyIndicator.setIsBusy(listContainersOperation, false, cancelOperation);

                            if (e) {
                                showError(e);
                            }

                            blobsPresenter.showBlobs(d.entries, null,
                                // load image
                                function(selectedBlob, showBase64) {
                                    if ($busyIndicator.getIsBusy(loadBlobOperation) === false) {
                                        $busyIndicator.setIsBusy(loadBlobOperation, true, cancelOperation);

                                        var buffer = bufferFactory.Buffer;
                                        var stream = defaultClientFactory().createReadStream(containerResult.name, selectedBlob.name);
                                        var chunks = [];
                                        stream.on('data', function(chunk) { chunks.push(chunk); });
                                        stream.on('end', function () {
                                            $busyIndicator.setIsBusy(loadBlobOperation, false, cancelOperation);

                                            var result = buffer.concat(chunks);
                                            var img = result.toString('base64');
                                            showBase64(img);
                                        });
                                    }
                                },
                                // load text
                                function(selectedBlob, showText) {
                                    if ($busyIndicator.getIsBusy(loadBlobOperation) === false) {
                                        $busyIndicator.setIsBusy(loadBlobOperation, true, cancelOperation);
                                        defaultClientFactory().getBlobToText(
                                            containerResult.name,
                                            selectedBlob.name,
                                            function (ex, text) {
                                                $busyIndicator.setIsBusy(loadBlobOperation, false, cancelOperation);
                                                showText(text);
                                            });
                                    }
                                },
                                // load bytes
                                function (selectedBlob, downloadBytes) {
                                    if ($busyIndicator.getIsBusy(loadBlobOperation) === false) {
                                        $busyIndicator.setIsBusy(loadBlobOperation, true, cancelOperation);

                                        var buffer = bufferFactory.Buffer;
                                        var stream = defaultClientFactory().createReadStream(containerResult.name, selectedBlob.name);
                                        var chunks = [];
                                        stream.on('data', function(chunk) { chunks.push(chunk); });
                                        stream.on('end', function () {
                                            $busyIndicator.setIsBusy(loadBlobOperation, false, cancelOperation);
                                            var result = buffer.concat(chunks);
                                            downloadBytes([result.buffer]);
                                        });
                                    }
                                });
                        };
                        if (pattern == null) {
                            defaultClientFactory().listBlobsSegmented(containerResult.name, null, proceedBlobs);
                        } else {
                            defaultClientFactory().listBlobsSegmentedWithPrefix(containerResult.name, pattern, null, proceedBlobs);
                        }
                    };

                    var loadContainerList = function () {
                        $notifyViewModel.close();
                        if ($busyIndicator.getIsBusy(listContainersOperation) === false) {
                            var cancelled = false;
                            $busyIndicator.setIsBusy(listContainersOperation, true, function () { cancelled = true; });

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

                                containerSelectionViewModel.Containers = containers;
                                if (containerSelectionViewModel.Containers != null && containerSelectionViewModel.Containers.length > 0) {
                                    containerSelectionViewModel.SelectedContainer = containerSelectionViewModel.Containers[0];
                                    blobsPresenter.showContainers(containerSelectionViewModel.Containers, function(containerResult) {
                                        containerSelectionViewModel.SelectedContainer = containerResult;
                                        loadBlobs(containerResult);
                                    }, function() {});
                                }
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
                };
            }
        ]);
};