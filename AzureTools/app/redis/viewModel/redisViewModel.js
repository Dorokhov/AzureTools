exports.create = function (redisClientFactory, dataTablePresenter, $actionBarItems, $dialogViewModel, $redisSettings, $redisScanner, $busyIndicator) {
    'use strict';

    return new function () {
        var self = this;

        var loadKeysOperation = 'loadKeys';

        var createClient = function (dbNumber) {
            var client = redisClientFactory($redisSettings.Host, $redisSettings.Port, $redisSettings.Password);
            if (dbNumber !== null) {
                client.select(dbNumber);
            }

            return client;
        }

        self.Keys = [];
        var searchViewModel = {
            search: function () {
                self.loadKeys(this.Pattern);
            },
            Pattern: '*'
        };

        var databaseViewModel = {
            setCurrent: function (n) {
                this.Current = n;
                searchViewModel.search();
            },
            Current: 0
        };
        // redis action bar
        $actionBarItems.IsActionBarVisible = true;
        $actionBarItems.IsAddKeyVisible = true;
        $actionBarItems.IsRefreshVisible = true;
        $actionBarItems.IsSettingsVisible = true;
        $actionBarItems.IsSearchVisible = true;
        $actionBarItems.IsDatabaseSelectVisible = true;

        $actionBarItems.addKey = function () {
            $dialogViewModel.IsVisible = true;
            $dialogViewModel.BodyViewModel = {
                Key: '',
                Value: '',
                Types: ['string', 'set'],
                SelectedType: 'string',
                selectType: function (value) {
                    this.SelectedType = value;
                }
            };
            $dialogViewModel.Body = 'createKeyTemplate';
            $dialogViewModel.Header = 'Add Key';

            $dialogViewModel.save = function () {
                $dialogViewModel.IsVisible = false;
                var type = $dialogViewModel.BodyViewModel.SelectedType;
                if (type === 'string') {
                    createClient(databaseViewModel.Current).set($dialogViewModel.BodyViewModel.Key, $dialogViewModel.BodyViewModel.Value, function () { });
                }
                else if (type === 'set') {
                    var members = JSON.parse($dialogViewModel.BodyViewModel.Value);
                    createClient(databaseViewModel.Current).sadd($dialogViewModel.BodyViewModel.Key, members);
                } else {
                    throw new Error('Unsupported creating data type: ' + type);
                }
            };
        };

        $actionBarItems.refresh = function () {
            searchViewModel.search();
        };

        $actionBarItems.changeSettings = function () {
            $dialogViewModel.IsVisible = true;
            $dialogViewModel.BodyViewModel = $redisSettings;
            $dialogViewModel.Body = 'changeSettingsTemplate';
            $dialogViewModel.Header = 'Settings';
        };

        $actionBarItems.SearchViewModel = searchViewModel;
        $actionBarItems.DatabaseViewModel = databaseViewModel;

        // load redis data
        self.loadKeys = function (pattern) {
            if ($busyIndicator.getIsBusy(loadKeysOperation) === false) {
                $busyIndicator.setIsBusy(loadKeysOperation, true);
                self.Keys.length = 0;
                $redisScanner({
                    pattern: pattern ? pattern : '*',
                    redis: createClient(databaseViewModel.Current),
                    each_callback: function (type, key, subkey, p, value, cb) {
                        if (type === 'set') {
                            // group values by key for set
                            var existing = self.Keys.filter(function (item) {
                                return item.Key == key;
                            });
                            
                            if (existing !== null && existing[0] !== undefined) {
                                var values = JSON.parse(existing[0].Value);
                                values.push(value);
                                existing[0].Value = JSON.stringify(values);
                            } else {
                                self.Keys.push({ Key: key, Type: type, Value: JSON.stringify([value]) });
                            }
                        } else {
                            self.Keys.push({ Key: key, Type: type, Value: value});
                        }
                        cb();
                    },
                    done_callback: function (err) {
                        $busyIndicator.setIsBusy(loadKeysOperation, false);
                        if (err) {
                            console.log('Error:' + err);
                        }
                        dataTablePresenter.showKeys(self.Keys, self.updateKey);
                    }
                });
            }
        };
        self.updateKey = function (keyData, newValue) {
            var type = keyData.Type;
            if (type === 'string') {
                console.log('Update. Key:' + keyData.Key + ' Value:' + newValue);
                createClient(databaseViewModel.Current).set(keyData.Key, newValue);
            }
            else if (type === 'set') {
                var updatedMembers = JSON.parse(newValue);
                createClient(databaseViewModel.Current).del(keyData.Key);
                createClient(databaseViewModel.Current).sadd(keyData.Key, updatedMembers);
            }
        };
        self.loadKeys(searchViewModel.Pattern);
    }
}