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

                        'util': './node_modules/net-chromify/node_modules/util/util',
                        'events': './node_modules/net-chromify/node_modules/events/events',
                        'buffer': './node_modules/net-chromify/node_modules/buffer/index',
                        'crypto': './node_modules/browserify/node_modules/crypto-browserify/index',

                        'freelist': './node_modules/freelist-chromify',
                        'http_parser': './node_modules/http-parser-js/http-parser',
                        'http': './node_modules/http-chromify/index',
                        'net': './node_modules/net-chromify/index',
                        'string_decoder': './node_modules/string_decoder-chromify/index.js',
                    },
                }
            }
        },
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', 'build', ['browserify']);
};