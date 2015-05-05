exports.create = function (redisClientFactory, dataTablePresenter, $actionBarItems, $dialogViewModel, $redisSettings, $redisScanner, $busyIndicator) {
    'use strict';

    return new function () {
        var self = this;

        var loadKeysOperation = 'loadKeys';

        var createClient = function () {
            var client = redisClientFactory($redisSettings.Host, $redisSettings.Port, $redisSettings.Password);
            return client;
        }

        self.Keys = [];
        var searchViewModel = {
            search: function () {
                self.loadKeys(this.Pattern);
            },
            Pattern: '*'
        };
        // redis action bar
        $actionBarItems.IsActionBarVisible = true;
        $actionBarItems.IsAddKeyVisible = true;
        $actionBarItems.IsRefreshVisible = true;
        $actionBarItems.IsSettingsVisible = true;
        $actionBarItems.IsSearchVisible = true;

        $actionBarItems.addKey = function () {
            $dialogViewModel.IsVisible = true;
            $dialogViewModel.BodyViewModel = { Key: '', Value: '' };
            $dialogViewModel.Body = 'createKeyTemplate';
            $dialogViewModel.Header = 'Add Key';

            $dialogViewModel.save = function () {
                $dialogViewModel.IsVisible = false;

                createClient().set($dialogViewModel.BodyViewModel.Key, $dialogViewModel.BodyViewModel.Value, function () {

                });
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

        // load redis data
        self.loadKeys = function (pattern) {
            if ($busyIndicator.getIsBusy(loadKeysOperation) === false) {
                $busyIndicator.setIsBusy(loadKeysOperation, true);
                self.Keys.length = 0;
                $redisScanner({
                    pattern: pattern ? pattern : '*',
                    redis: createClient(),
                    each_callback: function (type, key, subkey, p, value, cb) {
                        self.Keys.push({ Key: key, Type: type, Value: value });
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
        self.updateKey = function(keyData, newValue) {
            var type = keyData.Type;
            if (type === 'string') {
                console.log('Update. Key:' + keyData.Key + ' Value:' + newValue);
                createClient().set(keyData.Key, newValue);
            }
        };
        self.loadKeys(searchViewModel.Pattern);
    }
}