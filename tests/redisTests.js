'use strict';
describe('RedisController', function () {
    beforeEach(module('app'));
    beforeEach(function () {
        angular.module('tiles.redis')
            .factory('$redisClientFactory', function () {
                return redisClientFactoryMock;
            })
          .factory('$redisScannerFactory', [
            '$redisDataAccess', '$redisScanner',
            function ($redisDataAccess, $redisScanner) {
                return redisScannerMock;
            }
          ]);
    });


    it('should load keys from redis',
        inject(function ($rootScope, $controller) {
            // arrange
            var scope = $rootScope.$new();
            $controller("RedisController", {
                $scope: scope,

            });
            var viewModel = scope;
            data = [
                { Key: 'key:1', Type: 'string', Value: '1' },
                { Key: 'key:2', Type: 'string', Value:'2' }
            ];

            // act
            viewModel.loadKeys('*');

            // assert
            expect(viewModel.keyOptions.data.length).toBe(2);
            expect(viewModel.keyOptions.data[0].Key).toBe('key:1');
            expect(viewModel.keyOptions.data[1].Key).toBe('key:2');
        }));

    it('should save string value',
       inject(function ($rootScope, $controller, $actionBarItems, $dialogViewModel) {
           // arrange
           var scope = $rootScope.$new();
           $controller("RedisController", {
               $scope: scope,
           });
           var viewModel = scope;
           data = [
                { Key: 'key:1', Type: 'string', Value: '1' },
                { Key: 'key:2', Type: 'string', Value: '2' }
           ];
           var aDialog = $dialogViewModel();

           // act
           $actionBarItems.addKey();
           aDialog.BodyViewModel.Key = 'key:3';
           aDialog.BodyViewModel.Value = '3';
           aDialog.save();
           viewModel.loadKeys('*');

           // assert
           expect(viewModel.keyOptions.data.length).toBe(3);
           expect(viewModel.keyOptions.data[0].Key).toBe('key:1');
           expect(viewModel.keyOptions.data[1].Key).toBe('key:2');
           expect(viewModel.keyOptions.data[2].Key).toBe('key:3');
       }));
});