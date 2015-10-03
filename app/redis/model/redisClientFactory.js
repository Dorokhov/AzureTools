var redis = require("../../node_modules/redis/index.js");

exports.createClient = function (host, port, password) {
    console.log('Creating client ' + host + ' ' + port + ' ' + password);
    return redis.createClient(port, host, { auth_pass: password });
};