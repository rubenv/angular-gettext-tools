module.exports = (grunt) ->
    grunt.registerMultiTask 'nggettext_compile', 'Compile strings from .po files', () ->
        console.log @files

