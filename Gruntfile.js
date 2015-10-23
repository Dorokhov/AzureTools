module.exports = function(grunt) {

    grunt.initConfig({
        watch: {
            build: {
                files: ['./app/app.js'],
                tasks: ['browserify'],
                options: {
                    alias: {
                        'net': './libs/net-chromify/index.js',
                    }
                }
            }
        },
        sass: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'libs/datatables-colreorder/css',
                    src: ['*.scss'],
                    dest: 'app/content/css/styles/',
                    ext: '.css'
                },
{
                    expand: true,
                    cwd: 'libs/select/css',
                    src: ['*.scss'],
                    dest: 'app/content/css/styles/',
                    ext: '.css'
                }]
            }
        },
        browserify: {
            dist: {
                src: './app/app.js',
                dest: './app/bundle.js',
                options: {
                    alias: {
                        'jquery': 'jquery-browserify',
                        'colReorder': './libs/datatables-colreorder',
                        'colResize': './libs/colResize/dataTables.colResize',
                        'colVis': 'drmonty-datatables-colvis',
                        'dataTablesSelect' : './libs/select/js/dataTables.select',

                        'util': './libs/net-chromify/node_modules/util/util',
                        'events': './libs/net-chromify/node_modules/events/events',
                        'buffer': './libs/net-chromify/node_modules/buffer/index',
                        'crypto': './node_modules/browserify/node_modules/crypto-browserify/index',

                        'freelist': './libs/freelist-chromify',
                        'fs': './libs/http-parser-js/fs',
                        'http_parser': './libs/http-parser-js/http-parser',
                        'http': './libs/http-chromify/index',
                        'net': './libs/net-chromify/index',
                        'string_decoder': './libs/string_decoder-chromify/index.js',
                    },
                    debug: true
                }
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', 'build', ['sass', 'browserify']);
};