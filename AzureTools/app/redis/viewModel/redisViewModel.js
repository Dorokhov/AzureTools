exports.create = function (redisClientFactory, dataTablePresenter, $actionBarItems, $dialogViewModel, $redisSettings, $redisScanner) {
    'use strict';

    return new function () {
        'use strict';

        var self = this;
        var client = redisClientFactory($redisSettings.Host, $redisSettings.Port, $redisSettings.Password);
        
        self.Keys = [];

        $actionBarItems.IsActionBarVisible = true;
        $actionBarItems.IsAddKeyVisible = true;
        $actionBarItems.IsRefreshVisible = true;
        $actionBarItems.IsSettingsVisible = true;

        $actionBarItems.addKey = function () {
            $dialogViewModel.IsVisible = true;
            $dialogViewModel.BodyViewModel = {Key:'', Value:''};
            $dialogViewModel.Body = 'createKeyTemplate';
            $dialogViewModel.Header = 'Add Key';

            $dialogViewModel.save = function() {
                $dialogViewModel.IsVisible = false;
                
                client.set($dialogViewModel.BodyViewModel.Key, $dialogViewModel.BodyViewModel.Value, function() {
                    
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
            //client.scan(0,  function (err, keys) {
            //    if (err) {
            //        console.log(err);
            //    }

            //    dataTablePresenter.showKeys(keys);
            //})
            self.Keys.length = 0;
            $redisScanner({
                redis: client,
                each_callback: function (type, key, subkey, p, value, cb) {
                    console.log('Key:' + key + 'Type' + type);
                    self.Keys.push({Key:key, Type:type});
                    cb();
                },
                done_callback: function (err) {
                    if (err) {
                        console.log('Error:' + err);
                    }
                    dataTablePresenter.showKeys(self.Keys);
                    //client.quit();
                }
            });
        };
        

        self.loadKeys();
    }
}