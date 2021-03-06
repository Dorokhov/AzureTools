﻿exports.register = function(module) {
    module
        .controller('RedisController', [
            '$scope',
            '$timeout',
            '$activeDatabase',
            '$redisRepositoryFactory',
            'redisRepo',
            '$redisScannerFactory',
            '$dataTablePresenter',
            '$actionBarItems',
            '$dialogViewModel',
            '$confirmViewModel',
            '$notifyViewModel',
            '$redisSettings',
            '$busyIndicator',
            '$messageBus',
            '$validator',
            'uiGridConstants',
            function(
                $scope,
                $timeout,
                $activeDatabase,
                $redisRepositoryFactory,
                redisRepo,
                $redisScannerFactory,
                $dataTablePresenter,
                $actionBarItems,
                $dialogViewModel,
                $confirmViewModel,
                $notifyViewModel,
                $redisSettings,
                $busyIndicator,
                $messageBus,
                $validator,
                uiGridConstants) {
                var loadKeysOperation = 'loadKeys';
                var loadDetailsOperation = 'loadDetails';

                var searchViewModel = {
                    search: function() {
                        $scope.loadKeys(this.Pattern);
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

                var databaseViewModel = {
                    setCurrent: function(n) {
                        $activeDatabase.Current = n;
                        this.Current = n;
                        searchViewModel.search();
                    },
                    Current: $activeDatabase.Current
                };

                $scope.keyOptions = {
                    enableSorting: true,
                    columnDefs: [{
                        name: 'Key',
                        field: 'Key',
                        width: '*',
                        sort: {
                            direction: uiGridConstants.ASC,
                            priority: 0,
                        }
                    }],
                    rowHeight: 18,
                    data: [],
                    noUnselect: true,
                    enableRowSelection: true,
                    enableSelectAll: false,
                    enableFullRowSelection: true,
                    enableRowHeaderSelection: false,
                    multiSelect: true,
                    enableColumnMenus: false,
                    selectedKeys: [],
                    modifierKeysToMultiSelect: true,
                    onRegisterApi: function(gridApi) {
                        $scope.keyApi = gridApi;
                        $scope.keyApi.selection.on.rowSelectionChanged($scope, function(row) {
                            if ($busyIndicator.getIsBusy(loadDetailsOperation) === false) {
                                $busyIndicator.setIsBusy(loadDetailsOperation, true);
                                redisRepo.getKey(row.entity.Key, function(result) {
                                    $busyIndicator.setIsBusy(loadDetailsOperation, false);

                                    $scope.keyOptions.selectedKeys = [result];

                                    if (result.Type === 'hash') {
                                        var data = result.Value;
                                        var hash = [];
                                        for (var name in data) {
                                            var value = data[name];
                                            hash.push({
                                                Name: name,
                                                Value: value
                                            });
                                        }
                                        $scope.hashOptions.data = hash;
                                    } else if (result.Type === 'set') {
                                        var data = result.Value;
                                        var set = [];
                                        for (var i = 0; i < data.length; i++) {
                                            set.push({
                                                Value: data[i]
                                            });
                                        };
                                        $scope.setOptions.data = set;
                                    }
                                });
                            }
                        });
                        gridApi.selection.on.rowSelectionChangedBatch($scope, function(rows) {
                            $scope.keyOptions.selectedKeys.length = 0;
                            for (var i = 0; i < rows.length; i++) {
                                $scope.keyOptions.selectedKeys.push(rows[i].entity);
                            };
                        });
                    },
                    getStyle: function() {
                        return {
                            height: '100%'
                        };
                    }
                };

                $scope.hashMemberForEdit = null;
                $scope.hashOptions = {
                    enableSorting: true,
                    columnDefs: [{
                        name: 'Name',
                        field: 'Name',
                        width: '*'
                    }, {
                        name: 'Value',
                        field: 'Value',
                        width: '*'
                    }],
                    rowHeight: 18,
                    data: [],
                    enableRowSelection: true,
                    enableSelectAll: false,
                    enableFullRowSelection: true,
                    enableRowHeaderSelection: false,
                    multiSelect: false,
                    enableColumnMenus: false,
                    selectedItems: [],
                    enableColumnResizing: true,
                    enableColumnReordering: true,
                    onRegisterApi: function(gridApi) {
                        $scope.hashApi = gridApi;
                        $scope.hashApi.selection.on.rowSelectionChanged($scope, function(row) {
                            $scope.hashMemberForEdit = {
                                Name: row.entity.Name,
                                Value: row.entity.Value
                            };
                            $scope.hashOptions.selectedItems = [row.entity];
                        });
                        gridApi.selection.on.rowSelectionChangedBatch($scope, function(rows) {
                            $scope.hashOptions.selectedItems.length = 0;
                            for (var i = 0; i < rows.length; i++) {
                                $scope.hashOptions.selectedItems.push(rows[i].entity);
                            };
                        });
                    },
                    getStyle: function() {
                        return {
                            height: '100%'
                        };
                    }
                };

                $scope.setMemberForEdit = null;
                $scope.setOptions = {
                    enableSorting: true,
                    columnDefs: [{
                        name: 'Value',
                        field: 'Value',
                        width: '*'
                    }],
                    rowHeight: 18,
                    data: [],
                    enableRowSelection: true,
                    enableSelectAll: false,
                    enableFullRowSelection: true,
                    enableRowHeaderSelection: false,
                    multiSelect: false,
                    enableColumnMenus: false,
                    selectedItems: [],
                    enableColumnResizing: true,
                    onRegisterApi: function(gridApi) {
                        $scope.hashApi = gridApi;
                        $scope.hashApi.selection.on.rowSelectionChanged($scope, function(row) {
                            $scope.setMemberForEdit = {
                                Value: row.entity.Value
                            };
                            $scope.setOptions.selectedItems = [row.entity];
                        });
                        gridApi.selection.on.rowSelectionChangedBatch($scope, function(rows) {
                            $scope.setOptions.selectedItems.length = 0;
                            for (var i = 0; i < rows.length; i++) {
                                $scope.setOptions.selectedItems.push(rows[i].entity);
                            };
                        });
                    },
                    getStyle: function() {
                        return {
                            height: '100%'
                        };
                    }
                };

                // redis action bar
                $actionBarItems.ModuleName = ': Redis';
                $actionBarItems.IsActionBarVisible = true;
                $actionBarItems.IsAddKeyVisible = true;
                $actionBarItems.IsRefreshVisible = true;
                $actionBarItems.IsSettingsVisible = true;
                $actionBarItems.IsSearchVisible = true;
                $actionBarItems.IsDatabaseSelectVisible = true;

                $actionBarItems.addKey = function() {
                    var addKeyDialog = $dialogViewModel();

                    addKeyDialog.WithOption = true;
                    addKeyDialog.IsChecked = true;
                    addKeyDialog.OptionText = 'Close dialog on save';
                    addKeyDialog.IsVisible = true;
                    addKeyDialog.BodyViewModel = {
                        Key: '',
                        Value: '',
                        Types: ['string', 'set', 'hash set'],
                        SelectedType: 'string',
                        selectType: function(value) {
                            this.SelectedType = value;
                            var example = '';
                            switch (this.SelectedType) {
                                case 'string':
                                    example = 'any string';
                                    break;
                                case 'set':
                                    example = '["set value 1", "set value 2"]';
                                    break;
                                case 'hash set':
                                    example = '[ ["name 1", "value 1"], ["name 2, "value 2"] ]';
                                    break;
                            }

                            this.ValueExample = 'Example: ' + example;
                        },
                        ValueExample: 'Example: any string'
                    };
                    addKeyDialog.Body = 'createKeyTemplate';
                    addKeyDialog.Header = 'Add Key';

                    addKeyDialog.save = function() {
                        var type = addKeyDialog.BodyViewModel.SelectedType;
                        var repo = $redisRepositoryFactory(type);
                        try {
                            repo.create(
                                addKeyDialog.BodyViewModel.Key,
                                addKeyDialog.BodyViewModel.Value);
                        } catch (e) {
                            if (e.name && e.name === 'Json Parse Error') {
                                console.log(e.details);
                                showError(e.message + ' ' + addKeyDialog.BodyViewModel.ValueExample);
                                return;
                            }

                            throw e;
                        }

                        addKeyDialog.BodyViewModel.Key = '';
                        addKeyDialog.BodyViewModel.Value = '';

                        if (addKeyDialog.IsChecked) {
                            addKeyDialog.IsVisible = false;
                            searchViewModel.search();
                        }
                    };
                };

                $actionBarItems.removeKey = function() {
                    $scope.removeKey();
                };

                $actionBarItems.refresh = function() {
                    searchViewModel.search();
                };

                $actionBarItems.changeSettings = function() {
                    var changeSettingsDialog = $dialogViewModel();
                    changeSettingsDialog.AreButtonsDisabled = false;
                    changeSettingsDialog.WithOption = true;
                    changeSettingsDialog.OptionText = 'Use demo credentials';
                    changeSettingsDialog.IsChecked = false;
                    changeSettingsDialog.onChecked = function() {
                        if (changeSettingsDialog.IsChecked) {
                            changeSettingsDialog.BodyViewModel.Host = 'redisdor.redis.cache.windows.net';
                            changeSettingsDialog.BodyViewModel.Port = 6379;
                            changeSettingsDialog.BodyViewModel.Password = 'ZaVlBh0AHJmw2r3PfWVKvm7X3FfC5fe+sMKJ93RueNY=';
                        } else {
                            changeSettingsDialog.BodyViewModel.Host = $redisSettings.Host;
                            changeSettingsDialog.BodyViewModel.Port = $redisSettings.Port;
                            changeSettingsDialog.BodyViewModel.Password = $redisSettings.Password;
                        }
                    };
                    changeSettingsDialog.IsVisible = true;
                    changeSettingsDialog.BodyViewModel = {
                        Host: $redisSettings.Host,
                        Port: $redisSettings.Port,
                        Password: $redisSettings.Password,
                    }
                    changeSettingsDialog.Body = 'changeSettingsTemplate';
                    changeSettingsDialog.Header = 'Settings';
                    changeSettingsDialog.save = function() {
                        if ($validator.validatePort(+changeSettingsDialog.BodyViewModel.Port) === false) {
                            showError('Port value is wrong. Port must be in range [1;65535]');
                            return;
                        };

                        $redisSettings.Host = changeSettingsDialog.BodyViewModel.Host;
                        $redisSettings.Port = +changeSettingsDialog.BodyViewModel.Port;
                        $redisSettings.Password = changeSettingsDialog.BodyViewModel.Password;
                        changeSettingsDialog.IsVisible = false;
                        searchViewModel.search();
                    };
                };

                $scope.SearchViewModel = searchViewModel;
                $scope.DatabaseViewModel = databaseViewModel;

                // load redis data
                var maxItemsToLoad = 100;

                var loadKeyDetails = function() {
                    var client = $redisScannerFactory({
                        pattern: pattern,
                        each_callback: function(type, key, subkey, p, value, cb) {
                            var added = true;
                            if (type === 'set') {
                                added = groupByKey(type, key, value);
                            } else if (type === 'hash') {
                                added = groupByKey(type, key, [subkey, value]);
                            } else {
                                $scope.keyOptions.data.push({
                                    Key: key,
                                    Type: type,
                                    Value: value
                                });
                            }
                            loadedNumber = added === true ? loadedNumber + 1 : loadedNumber;

                            $scope.$apply(function() {
                                $busyIndicator.Text = 'Loading... ' + loadedNumber + ' items';
                            });

                            if ((searchViewModel.Pattern === '' || searchViewModel.Pattern === '*') && loadedNumber >= maxItemsToLoad) {
                                showInfo('First ' + maxItemsToLoad + ' loaded. Use search to find specific keys.');
                                cb(true);
                            } else {
                                cb(false);
                            }
                        },
                        done_callback: function(err) {
                            $busyIndicator.setIsBusy(loadKeysOperation, false);
                            if (err) {
                                $messageBus.publish('redis-communication-error', err);
                                $scope.loadKeys(pattern);
                            }
                        }
                    })
                };

                $scope.loadKeys = function(pattern) {
                    $notifyViewModel.close();
                    if ($busyIndicator.getIsBusy(loadKeysOperation) === false) {
                        console.log('LOAD')
                        $scope.setMemberForEdit = null;
                        $scope.setOptions.selectedItems = [];
                        $scope.setOptions.data = [];

                        $scope.hashMemberForEdit = null;
                        $scope.hashOptions.selectedItems = [];
                        $scope.hashOptions.data = [];

                        $scope.keyOptions.data.length = 0;
                        $scope.keyOptions.selectedKeys = [];
                        $busyIndicator.Text = 'Loading... ';

                        var repo = $redisRepositoryFactory('string');
                        repo.safeRedisCmd(function(client) {
                            client.keys(pattern ? pattern : '*', function(err, keys) {
                                if (err) return console.log(err);

                                for (var i = 0, len = keys.length; i < len; i++) {
                                    $scope.keyOptions.data.push({
                                        Key: keys[i]
                                    });
                                }

                                $busyIndicator.setIsBusy(loadKeysOperation, false);
                            });
                        });

                        $busyIndicator.setIsBusy(loadKeysOperation, true, function() {
                            client.end();
                        });
                    }
                };

                $scope.updateString = function() {
                    if ($scope.keyOptions.selectedKeys.length === 0) return;

                    var type = $scope.keyOptions.selectedKeys[0].Type;
                    var repo = $redisRepositoryFactory(type);
                    try {
                        repo.update($scope.keyOptions.selectedKeys[0].Key, $scope.keyOptions.selectedKeys[0].Value, function() {})
                    } catch (ex) {
                        showError(ex.message);
                    }
                };

                $scope.updateSet = function() {
                    if ($scope.keyOptions.selectedKeys.length === 0) return;

                    var selectedMember = $scope.setOptions.selectedItems.length > 0 ? $scope.setOptions.selectedItems[0] : null;
                    if (selectedMember == null) return;

                    var type = $scope.keyOptions.selectedKeys[0].Type;
                    var repo = $redisRepositoryFactory(type);
                    try {
                        repo.update($scope.keyOptions.selectedKeys[0].Key, selectedMember.Value, $scope.setMemberForEdit.Value, function() {})
                    } catch (ex) {
                        showError(ex.message);
                    }
                };

                $scope.updateKey = function() {
                    if ($scope.keyOptions.selectedKeys.length === 0) return;

                    var selectedMember = $scope.hashOptions.selectedItems.length > 0 ? $scope.hashOptions.selectedItems[0] : null;
                    if (selectedMember == null) return;

                    var type = $scope.keyOptions.selectedKeys[0].Type;
                    var repo = $redisRepositoryFactory(type);
                    try {
                        if (type === 'hash') {
                            if ($scope.hashMemberForEdit.Name === selectedMember.Name) {
                                repo.hset($scope.keyOptions.selectedKeys[0].Key, selectedMember.Name, selectedMember.Value, function() {});
                            } else {
                                repo.replaceMember($scope.keyOptions.selectedKeys[0].Key, selectedMember.Name, $scope.hashMemberForEdit.Name, $scope.hashMemberForEdit.Value, function() {});
                            }
                        } else if (type === 'set') {
                            repo.update($scope.keyOptions.selectedKeys[0].Key, selectedMember.Name, selectedMember, $scope.setMemberForEdit.Value, function() {})
                        }
                    } catch (ex) {
                        showError(ex.message);
                    }
                };

                $scope.removeKey = function() {
                    if ($scope.keyOptions.selectedKeys == null || $scope.keyOptions.selectedKeys.length === 0) return;

                    $timeout(function() {
                        $confirmViewModel.scope().$apply(function() {
                            $confirmViewModel.Body = 'Are you sure you want to delete "' + ($scope.keyOptions.selectedKeys.length === 1 ? $scope.keyOptions.selectedKeys[0].Key : $scope.keyOptions.selectedKeys.length) + '"?';
                            $confirmViewModel.show(function() {
                                for (var i = 0; i < $scope.keyOptions.selectedKeys.length; i++) {
                                    var type = $scope.keyOptions.selectedKeys[i].Type;
                                    var repo = $redisRepositoryFactory(type);
                                    repo.delete($scope.keyOptions.selectedKeys[i]);
                                };
                                $scope.keyOptions.selectedKeys = [];
                                searchViewModel.search();
                            });
                        });
                    });
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

                var showInfo = function(msg) {
                    //if (msg !== undefined && msg !== null) {
                    //    $timeout(function() {
                    //        $notifyViewModel.scope().$apply(function() {
                    //            $notifyViewModel.showInfo(msg);
                    //        });
                    //    });
                    //}
                };


                $scope.$on('splitter-resize', function() {
                    $timeout(function() {
                        $dataTablePresenter.adjustColumns();
                    });
                });

                $messageBus.subscribe(
                    ['redis-communication-error'],
                    function(event, data) {
                        console.log('Received data: ' + data);
                        showError(data);
                    });

                // init
                if ($redisSettings.isEmpty()) {
                    $actionBarItems.changeSettings();
                } else {
                    $timeout(function() {
                        $actionBarItems.refresh();
                    })
                }
            }
        ]);
};