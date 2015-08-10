var redis = require("../../node_modules/redis/index.js");

exports.createClient = function (host, port, password) {
    console.log('Creating client ' + host + ' ' + port + ' ' + password);
    return redis.createClient(6379, 'redisdor.redis.cache.windows.net', { auth_pass: 'iB1Ku6vN4CJPvirkupbDX0mhH6vUFxkTLpWoJTfc+dM=' });
};