module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    ngmin:{
        app: {
            src: ['src/modules/*.js',  'src/angularity.js'],
            dest : 'build/angularity.js'
        }
    },
    uglify: {
      build: {
        src: 'build/angularity.js',
        dest: 'build/angularity.min.js'
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-ngmin');

  // Default task(s).
  grunt.registerTask('default', ['ngmin', 'uglify']);

};
