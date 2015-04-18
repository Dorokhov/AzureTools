var redis = require("../../node_modules/redis/index.js");

exports.createClient = function () {
    return redis.createClient(6379, 'redisdor.redis.cache.windows.net', { auth_pass: 'ZaVlBh0AHJmw2r3PfWVKvm7X3FfC5fe+sMKJ93RueNY=' });
};