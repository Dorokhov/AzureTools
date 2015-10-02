module.exports = function (grunt) {

    grunt.initConfig({
        watch: {
            build: {
                files: ['./app/app.js'],
                tasks: ['browserify'],
                options: {
                    alias: {

                        'net': './libs/net-chromify/index.js'
                    }
                }
            }
        },
        browserify: {
            vendor: {
                src: './app/app.js',
                dest: './app/bundle.js',
                options: {
                    alias: {
                        'jquery': 'jquery-browserify',

                        'util': './libs/net-chromify/node_modules/util/util',
                        'events': './libs/net-chromify/node_modules/events/events',
                        'buffer': './libs/net-chromify/node_modules/buffer/index',
                        'crypto': './node_modules/browserify/node_modules/crypto-browserify/index',

                        'freelist': './libs/freelist-chromify',
                        'http_parser': './libs/http-parser-js/http-parser',
                        'http': './libs/http-chromify/index',
                        'net': './libs/net-chromify/index',
                        'string_decoder': './libs/string_decoder-chromify/index.js',
                    },
                }
            }
        },
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', 'build', ['browserify']);
};