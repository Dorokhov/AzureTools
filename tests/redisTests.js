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
            var viewModel = scope.RedisViewModel;
            data = [
                { Key: 'key:1', Type: 'string', Value: '1' },
                { Key: 'key:2', Type: 'string', Value:'2' }
            ];

            // act
            viewModel.loadKeys('*');

            // assert
            expect(viewModel.Keys.length).toBe(2);
            expect(viewModel.Keys[0].Key).toBe('key:1');
            expect(viewModel.Keys[1].Key).toBe('key:2');
        }));

    it('should save string value',
       inject(function ($rootScope, $controller, $actionBarItems, $dialogViewModel) {
           // arrange
           var scope = $rootScope.$new();
           $controller("RedisController", {
               $scope: scope,
           });
           var viewModel = scope.RedisViewModel;
           data = [
                { Key: 'key:1', Type: 'string', Value: '1' },
                { Key: 'key:2', Type: 'string', Value: '2' }
           ];

           // act
           $actionBarItems.addKey();
           $dialogViewModel.BodyViewModel.Key = 'key:3';
           $dialogViewModel.BodyViewModel.Value = '3';
           $dialogViewModel.save();
           viewModel.loadKeys('*');

           // assert
           expect(viewModel.Keys.length).toBe(3);
           expect(viewModel.Keys[0].Key).toBe('key:1');
           expect(viewModel.Keys[1].Key).toBe('key:2');
           expect(viewModel.Keys[2].Key).toBe('key:3');
       }));

    it('should save hash set',
       inject(function ($rootScope, $controller, $actionBarItems, $dialogViewModel) {
           // arrange
           var scope = $rootScope.$new();
           $controller("RedisController", {
               $scope: scope,
           });
           var viewModel = scope.RedisViewModel;
           data = [
                { Key: 'key:1', Type: 'string', Value: '1' },
                { Key: 'key:2', Type: 'string', Value: '2' }
           ];

           // act
           $actionBarItems.addKey();
           $dialogViewModel.BodyViewModel.Key = 'key:3';
           $dialogViewModel.BodyViewModel.Value = '[["name1","value1"],["name2", "value2"]]';
           $dialogViewModel.BodyViewModel.selectType('hash set');
           $dialogViewModel.save();
           viewModel.loadKeys('*');

           // assert
           expect(viewModel.Keys.length).toBe(3);
           expect(viewModel.Keys[2].Key).toBe('key:3');
           expect(viewModel.Keys[2].Value).toBe('[["name1","value1"],["name2","value2"]]');
       }));

    it('should save set',
       inject(function ($rootScope, $controller, $actionBarItems, $dialogViewModel) {
           // arrange
           var scope = $rootScope.$new();
           $controller("RedisController", {
               $scope: scope,
           });
           var viewModel = scope.RedisViewModel;
           data = [
                { Key: 'key:1', Type: 'string', Value: '1' },
                { Key: 'key:2', Type: 'string', Value: '2' }
           ];

           // act
           $actionBarItems.addKey();
           $dialogViewModel.BodyViewModel.Key = 'key:3';
           $dialogViewModel.BodyViewModel.Value = '["item1","item2"]';
           $dialogViewModel.BodyViewModel.selectType('set');
           $dialogViewModel.save();
           viewModel.loadKeys('*');

           // assert
           expect(viewModel.Keys.length).toBe(3);
           expect(viewModel.Keys[2].Key).toBe('key:3');
           expect(viewModel.Keys[2].Value).toBe('["item1","item2"]');
       }));
});