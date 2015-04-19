exports.create = function ($state) {
    return new function() {
        var self = this;
        self.openRedis = function() {
            $state.go('redis', {});
        }
    }
}