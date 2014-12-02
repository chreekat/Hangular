module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jslint: {
            all: {
                src: [
                    "fladdermus.js",
                    "gameBoard.js",
                ]
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-jslint');

    // Default task(s).
    grunt.registerTask('default', ['jslint']);

};
