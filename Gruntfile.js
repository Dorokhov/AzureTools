module.exports = function(grunt) {
  grunt.initConfig({
    watch: {
      build: {
          files: [],
          tasks: ['browserify'],
          options: {
          }
      }
    },
    browserify: {
      vendor: {
        src: './app.js',
        dest: './bundle.js'
      }
    },
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('build', ['browserify']);
};