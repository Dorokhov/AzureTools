module.exports = function (grunt) {

    grunt.initConfig({
        watch: {
            build: {
                files: ['./app.js'],
                tasks: ['browserify'],
                options: {
                    alias: {

                        'net': './node_modules/net-chromify/index.js'
                    }
                }
            }
        },
        browserify: {
            vendor: {
                src: './app.js',
                dest: './bundle.js',
                options: {
                    alias: {
                        'jquery': 'jquery-browserify',

                        //'process': './node_modules/chromify/builtins/__chromify_process',
                        //'_linklist': './node_modules/chromify/builtins/_linklist',
                        //'cluster': './node_modules/chromify/builtins/cluster',
                        //'dns': 'chromify/builtins/dns',
                        //'freelist': './node_modules/chromify/builtins/__chromify_freelist',

                        'util': './node_modules/net-chromify/node_modules/util/util',
                       // 'stream': './node_modules/net-chromify/node_modules/stream/index',
                        'events': './node_modules/net-chromify/node_modules/events/events',
                        'buffer': './node_modules/net-chromify/node_modules/buffer/index',
                        'crypto': './node_modules/browserify/node_modules/crypto-browserify/index',

                        'freelist': './node_modules/freelist-chromify',
                        'http_parser': './node_modules/http-parser-js/http-parser',
                        'http': './node_modules/http-chromify/index',
                        'net': './node_modules/net-chromify/index',
                       // 'timers': './node_modules/chromify/builtins/timers',
                        'string_decoder': './node_modules/string_decoder-chromify/index.js',


                        //'freelist': 'freelist-chromify',
                        //'net': 'net-chromify',
                        //'http_parser': 'http-parser-js',
                        //'http': 'http-chromify',
                        //'events': 'events',
                        //'path': 'path',
                        //'vm': 'vm',
                        //'crypto': 'crypto',
                        //'assert': 'assert',
                        //'url': 'url',
                        //'buffer': 'buffer',
                        //'util': 'util',
                        //'querystring': 'querystring',
                        //'stream': 'stream'
                    },
                }
            }
        },
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', 'build', ['browserify']);
};