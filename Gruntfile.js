module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-mocha-cli');
    grunt.loadNpmTasks('grunt-bump');

    grunt.initConfig({
        eslint: {
            target: ['*.js', '{lib,test}/**/*.js', '!test/fixtures/*.js']
        },

        clean: {
            tmp: ['tmp']
        },

        watch: {
            test: {
                files: ['lib/**.js', 'test/**/*.{js,coffee}'],
                tasks: ['test']
            }
        },

        mochacli: {
            spec: {
                options: {
                    reporter: 'spec'
                }
            }
        },

        bump: {
            options: {
                files: ['package.json'],
                commitFiles: ['-a'],
                pushTo: 'origin'
            }
        }
    });

    grunt.registerTask('default', ['test']);
    grunt.registerTask('build', ['clean', 'eslint']);
    grunt.registerTask('test', ['build', 'mochacli']);
};
