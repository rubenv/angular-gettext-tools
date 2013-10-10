module.exports = (grunt) ->
    @loadNpmTasks('grunt-contrib-clean')
    @loadNpmTasks('grunt-contrib-coffee')
    @loadNpmTasks('grunt-contrib-watch')
    @loadNpmTasks('grunt-mocha-cli')
    @loadNpmTasks('grunt-release')

    @loadTasks('tasks')

    @initConfig
        coffee:
            tasks:
                options:
                    bare: true
                expand: true
                cwd: 'src'
                src: ['*.coffee']
                dest: 'tasks'
                ext: '.js'

        clean:
            tasks: ['tasks']
            tmp: ['tmp']

        watch:
            all:
                files: ['src/**.coffee']
                tasks: ['build']
            test:
                files: ['tasks/**.js', 'test/*{,/*}.coffee']
                tasks: ['runtests']

        mochacli:
            options:
                files: 'test/*_test.coffee'
                compilers: ['coffee:coffee-script']
            spec:
                options:
                    reporter: 'spec'

        nggettext_extract:
            auto:
                files:
                    'tmp/test1.pot': 'test/fixtures/single.html'
                    'tmp/test2.pot': ['test/fixtures/single.html', 'test/fixtures/second.html']
                    'tmp/test3.pot': 'test/fixtures/plural.html'
                    'tmp/test4.pot': 'test/fixtures/merge.html'
                    'tmp/test6.pot': 'test/fixtures/filter.html'
                    'tmp/test7.pot': 'test/fixtures/source.js'
                    'tmp/test8.pot': 'test/fixtures/quotes.html'
                    'tmp/test9.pot': 'test/fixtures/strip.html'
                    'tmp/test10.pot': 'test/fixtures/ngif.html'
                    'tmp/test12.pot': 'test/fixtures/php.php'
            manual:
                files:
                    'tmp/test5.pot': 'test/fixtures/corrupt.html'
            custom:
                options:
                    startDelim: '[['
                    endDelim: ']]'
                files:
                    'tmp/test11.pot': 'test/fixtures/delim.html'

        nggettext_compile:
            test1:
                files:
                    'tmp/test1.js': 'test/fixtures/nl.po'

            test2:
                options:
                    module: 'myApp'
                files:
                    'tmp/test2.js': 'test/fixtures/nl.po'

            test3:
                files:
                    'tmp/test3.js': 'test/fixtures/{nl,fr}.po'

    @registerTask 'default', ['test']
    @registerTask 'build', ['clean', 'coffee']
    @registerTask 'package', ['build', 'release']
    @registerTask 'runtests', ['clean:tmp', 'nggettext_extract:auto', 'nggettext_extract:custom', 'nggettext_compile', 'mochacli']
    @registerTask 'test', ['build', 'runtests']
