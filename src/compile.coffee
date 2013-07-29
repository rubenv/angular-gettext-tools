po = require 'node-po'

template = (module, body) -> """
angular.module("#{module}").run(['gettextCatalog', function (gettextCatalog) {
#{body}
}]);
"""

langTemplate = (language, strings) -> "    gettextCatalog.setStrings('#{language}', #{JSON.stringify(strings)});\n"

module.exports = (grunt) ->
    grunt.registerMultiTask 'nggettext_compile', 'Compile strings from .po files', () ->
        options = @options({
            module: 'gettext'
        })

        @files.forEach (file) ->
            body = ''

            file.src.forEach (input) ->
                data = grunt.file.read(input)
                catalog = po.parse(data)

                if !catalog.headers.Language
                    throw new Error('No Language header found!')

                strings = {}
                for item in catalog.items
                    strings[item.msgid] = item.msgstr
                body += langTemplate(catalog.headers.Language, strings)

            grunt.file.write(file.dest, template(options.module, body))
