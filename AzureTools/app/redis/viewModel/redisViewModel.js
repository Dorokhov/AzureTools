exports.create = function (redisClientFactory, dataTablePresenter, $actionBarItems, $dialogViewModel, $redisSettings, $redisScanner, $busyIndicator) {
    'use strict';

    return new function () {
        var self = this;
        var createClient = function() {
            var client = redisClientFactory($redisSettings.Host, $redisSettings.Port, $redisSettings.Password);
            return client;
        }
        
        self.Keys = [];

        $actionBarItems.IsActionBarVisible = true;
        $actionBarItems.IsAddKeyVisible = true;
        $actionBarItems.IsRefreshVisible = true;
        $actionBarItems.IsSettingsVisible = true;

        $actionBarItems.addKey = function () {
            throw new Error('not implemented');
            $dialogViewModel.IsVisible = true;
            $dialogViewModel.BodyViewModel = {Key:'', Value:''};
            $dialogViewModel.Body = 'createKeyTemplate';
            $dialogViewModel.Header = 'Add Key';

            $dialogViewModel.save = function() {
                $dialogViewModel.IsVisible = false;
                
                createClient().set($dialogViewModel.BodyViewModel.Key, $dialogViewModel.BodyViewModel.Value, function () {
                    
                });
            };
        };
        $actionBarItems.refresh = function() {
            self.loadKeys();
        };
        $actionBarItems.changeSettings = function() {
            $dialogViewModel.IsVisible = true;
            $dialogViewModel.BodyViewModel = $redisSettings;
            $dialogViewModel.Body = 'changeSettingsTemplate';
            $dialogViewModel.Header = 'Settings';
        };

        self.loadKeys = function() {
            var loadKeysOperation = 'loadKeys';
            if ($busyIndicator.getIsBusy(loadKeysOperation) === false) {
                $busyIndicator.setIsBusy(loadKeysOperation, true);
                self.Keys.length = 0;
                $redisScanner({
                    redis: createClient(),
                    each_callback: function(type, key, subkey, p, value, cb) {
                        self.Keys.push({ Key: key, Type: type, Value: value });
                        cb();
                    },
                    done_callback: function(err) {
                        $busyIndicator.setIsBusy(loadKeysOperation, false);
                        if (err) {
                            console.log('Error:' + err);
                        }
                        dataTablePresenter.showKeys(self.Keys);
                    }
                });
            }
        };
        
        self.loadKeys();
    }
}