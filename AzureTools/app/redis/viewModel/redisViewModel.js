exports.register = function(module) {
    module
        .controller('RedisController', [
            '$scope',
            '$timeout',
            '$activeDatabase',
            '$redisRepositoryFactory',
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
            function(
                $scope,
                $timeout,
                $activeDatabase,
                $redisRepositoryFactory,
                $redisScannerFactory,
                $dataTablePresenter,
                $actionBarItems,
                $dialogViewModel,
                $confirmViewModel,
                $notifyViewModel,
                $redisSettings,
                $busyIndicator,
                $messageBus,
                $validator) {

                $scope.RedisViewModel = new function() {
                    var self = this;

                    var loadKeysOperation = 'loadKeys';

                    self.Keys = [];
                    var searchViewModel = {
                        search: function() {
                            self.loadKeys(this.Pattern);
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
                    // redis action bar
                    $actionBarItems.ModuleName = ': Redis';
                    $actionBarItems.IsActionBarVisible = true;
                    $actionBarItems.IsAddKeyVisible = true;
                    $actionBarItems.IsRefreshVisible = true;
                    $actionBarItems.IsSettingsVisible = true;
                    $actionBarItems.IsSearchVisible = true;
                    $actionBarItems.IsDatabaseSelectVisible = true;

                    $actionBarItems.addKey = function() {
                        $dialogViewModel.WithOption = true;
                        $dialogViewModel.IsChecked = true;
                        $dialogViewModel.OptionText = 'Close dialog on save';
                        $dialogViewModel.IsVisible = true;
                        $dialogViewModel.BodyViewModel = {
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
                        $dialogViewModel.Body = 'createKeyTemplate';
                        $dialogViewModel.Header = 'Add Key';

                        $dialogViewModel.save = function() {
                            var type = $dialogViewModel.BodyViewModel.SelectedType;
                            var repo = $redisRepositoryFactory(type);
                            try {
                                repo.create(
                                    $dialogViewModel.BodyViewModel.Key,
                                    $dialogViewModel.BodyViewModel.Value,
                                    function () {
                                        $dialogViewModel.BodyViewModel.Key = '';
                                        $dialogViewModel.BodyViewModel.Value = '';

                                        if ($dialogViewModel.IsChecked) {
                                            $dialogViewModel.IsVisible = false;
                                            searchViewModel.search();
                                        }
                                });
                            } catch (e) {
                                if (e.name && e.name === 'Json Parse Error') {
                                    console.log(e.details);
                                    showError(e.message + ' ' + $dialogViewModel.BodyViewModel.ValueExample);
                                    return;
                                }

                                throw e;
                            }
                        };
                    };

                    $actionBarItems.refresh = function() {
                        searchViewModel.search();
                    };

                    $actionBarItems.changeSettings = function() {
                        $dialogViewModel.WithOption = true;
                        $dialogViewModel.OptionText = 'Use demo credentials';
                        $dialogViewModel.IsChecked = false;
                        $dialogViewModel.onChecked = function() {
                            if ($dialogViewModel.IsChecked) {
                                $dialogViewModel.BodyViewModel.Host = 'redisdor.redis.cache.windows.net';
                                $dialogViewModel.BodyViewModel.Port = 6379;
                                $dialogViewModel.BodyViewModel.Password = 'ZaVlBh0AHJmw2r3PfWVKvm7X3FfC5fe+sMKJ93RueNY=';
                            } else {
                                $dialogViewModel.BodyViewModel.Host = $redisSettings.Host;
                                $dialogViewModel.BodyViewModel.Port = $redisSettings.Port;
                                $dialogViewModel.BodyViewModel.Password = $redisSettings.Password;
                            }
                        };
                        $dialogViewModel.IsVisible = true;
                        $dialogViewModel.BodyViewModel = {
                            Host: $redisSettings.Host,
                            Port: $redisSettings.Port,
                            Password: $redisSettings.Password,
                        }
                        $dialogViewModel.Body = 'changeSettingsTemplate';
                        $dialogViewModel.Header = 'Settings';
                        $dialogViewModel.save = function() {
                            if ($validator.validatePort(+$dialogViewModel.BodyViewModel.Port) === false) {
                                showError('Port value is wrong. Port must be in range [1;65535]');
                                return;
                            };

                            $redisSettings.Host = $dialogViewModel.BodyViewModel.Host;
                            $redisSettings.Port = +$dialogViewModel.BodyViewModel.Port;
                            $redisSettings.Password = $dialogViewModel.BodyViewModel.Password;
                            $dialogViewModel.IsVisible = false;
                            searchViewModel.search();
                        };
                    };

                    $actionBarItems.SearchViewModel = searchViewModel;
                    $actionBarItems.DatabaseViewModel = databaseViewModel;

                    var groupByKey = function(type, key, value) {
                        var existing = self.Keys.filter(function(item) {
                            return item.Key == key;
                        });

                        if (existing !== null && existing[0] !== undefined) {
                            var values = JSON.parse(existing[0].Value);
                            values.push(value);
                            existing[0].Value = JSON.stringify(values);
                        } else {
                            self.Keys.push({ Key: key, Type: type, Value: JSON.stringify([value]) });
                        }
                    }

                    // load redis data
                    var maxItemsToLoad = 100;

                    self.loadKeys = function(pattern) {
                        $notifyViewModel.close();
                        if ($busyIndicator.getIsBusy(loadKeysOperation) === false) {
                            self.Keys.length = 0;
                            var loadedNumber = 0;
                            var client = $redisScannerFactory({
                                pattern: pattern,
                                each_callback: function(type, key, subkey, p, value, cb) {
                                    if (type === 'set') {
                                        groupByKey(type, key, value);
                                    } else if (type == 'hash') {
                                        groupByKey(type, key, [subkey, value]);
                                    } else {
                                        self.Keys.push({ Key: key, Type: type, Value: value });
                                    }
                                    loadedNumber++;
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
                                    }

                                    $dataTablePresenter.showKeys(self.Keys, self.updateKey, self.removeKey);
                                }
                            });
                            $busyIndicator.setIsBusy(loadKeysOperation, true, function() {
                                client.end();
                            });
                        }
                    };

                    self.updateKey = function(keyData, newValue) {
                        var type = keyData.Type;
                        var repo = $redisRepositoryFactory(type);
                        repo.update(keyData, newValue);
                    };

                    self.removeKey = function(keyData) {
                        $confirmViewModel.scope().$apply(function() {
                            $confirmViewModel.Body = 'Are you sure you want to delete "' + keyData.Key + '"?';
                            $confirmViewModel.show(function() {
                                var type = keyData.Type;
                                var repo = $redisRepositoryFactory(type);
                                repo.delete(keyData);
                                searchViewModel.search();
                            });
                        });
                    };

                    // init
                    if ($redisSettings.isEmpty()) {
                        $actionBarItems.changeSettings();
                    } else {
                        self.loadKeys(searchViewModel.Pattern);
                    }

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
                    }

                    var showInfo = function(msg) {
                        if (msg !== undefined && msg !== null) {
                            $timeout(function() {
                                $notifyViewModel.scope().$apply(function() {
                                    $notifyViewModel.showInfo(msg);
                                });
                            });
                        }
                    }

                    $messageBus.subscribe(
                    ['redis-communication-error'], function(event, data) {
                        console.log('Received data: ' + data);
                        showError(data);
                    });
                };
            }
        ]);
};