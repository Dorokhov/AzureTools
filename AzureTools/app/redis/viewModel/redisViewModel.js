exports.create = function (
    $activeDatabase,
    $redisRepositoryFactory,
    $redisScannerFactory,
    $dataTablePresenter,
    $actionBarItems,
    $dialogViewModel,
    $confirmViewModel,
    $redisSettings,
    $busyIndicator) {
    'use strict';

    return new function () {
        var self = this;

        var loadKeysOperation = 'loadKeys';


        self.Keys = [];
        var searchViewModel = {
            search: function () {
                self.loadKeys(this.Pattern);
            },
            Pattern: '*'
        };

        var databaseViewModel = {
            setCurrent: function (n) {
                $activeDatabase.Current = n;
                this.Current = n;
                searchViewModel.search();
            },
            Current: $activeDatabase.Current
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
                Types: ['string', 'set', 'hash set'],
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
                var repo = $redisRepositoryFactory(type);
                repo.create($dialogViewModel.BodyViewModel.Key, $dialogViewModel.BodyViewModel.Value, function () { });
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
        
        var groupByKey = function(type, key, value) {
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
        }
        // load redis data
        self.loadKeys = function (pattern) {
            if ($busyIndicator.getIsBusy(loadKeysOperation) === false) {
                $busyIndicator.setIsBusy(loadKeysOperation, true);
                self.Keys.length = 0;

                $redisScannerFactory({
                    pattern: pattern,
                    each_callback: function (type, key, subkey, p, value, cb) {
                        if (type === 'set') {
                            groupByKey(type, key, value);
                        }
                        else if (type == 'hash') {
                            groupByKey(type, key, [subkey, value]);
                        }
                        else {
                            self.Keys.push({ Key: key, Type: type, Value: value });
                        }
                        cb();
                    },
                    done_callback: function (err) {
                        $busyIndicator.setIsBusy(loadKeysOperation, false);
                        if (err) {
                            console.log('Error:' + err);
                        }
                        $dataTablePresenter.showKeys(self.Keys, self.updateKey, self.removeKey);
                    }
                });
            }
        };

        self.updateKey = function (keyData, newValue) {
            var type = keyData.Type;
            var repo = $redisRepositoryFactory(type);
            repo.update(keyData, newValue);
        };

        self.removeKey = function (keyData) {
            $confirmViewModel.scope().$apply(function () {
                $confirmViewModel.Body = 'Are you sure you want to delete "' + keyData.Key + '"?';
                $confirmViewModel.show(function() {
                    var type = keyData.Type;
                    var repo = $redisRepositoryFactory(type);
                    repo.delete(keyData);
                    searchViewModel.search();
                });
            });
        };
        
        self.loadKeys(searchViewModel.Pattern);
    }
}