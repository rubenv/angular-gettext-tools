module.exports = (grunt) ->
    @loadNpmTasks('grunt-contrib-clean')
    @loadNpmTasks('grunt-contrib-jshint')
    @loadNpmTasks('grunt-contrib-watch')
    @loadNpmTasks('grunt-jscs-checker')
    @loadNpmTasks('grunt-mocha-cli')
    @loadNpmTasks('grunt-bump')

    @initConfig
        jshint:
            all: [ 'lib/*.js', 'index.js' ]
            options:
                jshintrc: '.jshintrc'

        jscs:
            src:
                options:
                    config: '.jscs.json'
                files:
                    src: ['*.{js,json}', '{lib,test}/**/*.js', '!test/fixtures/custom_marker_name.js']

        clean:
            tmp: ['tmp']

        watch:
            test:
                files: ['lib/**.js', 'test/*{,/*}.coffee']
                tasks: ['test']

        mochacli:
            options:
                files: 'test/*_test.coffee'
                compilers: ['coffee:coffee-script']
            spec:
                options:
                    reporter: 'spec'

        bump:
            options:
                files: ['package.json']
                commitFiles: ['-a']
                pushTo: 'origin'

    @registerTask 'default', ['test']
    @registerTask 'build', ['clean', 'jshint', 'jscs']
    @registerTask 'test', ['build', 'mochacli']
