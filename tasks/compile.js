var po = require('pofile');

module.exports = function (grunt) {
    grunt.registerMultiTask('nggettext_compile', 'Compile strings from .po files', function () {
        var outputFormatters = {
            'module': {
                addLocale: function(locale, strings) {
                    return "    gettextCatalog.setStrings('" + locale + "', " + (JSON.stringify(strings)) + ");\n";
                },
                format: function(locales, options) {
                    return "angular.module(\"" + options.moduleName +
                        "\").run(['gettextCatalog', function (gettextCatalog) {\n" + locales.join('') + "\n}]);";
                }
            },
            'json': {
                addLocale: function(locale, strings) {
                    return {locale: locale, strings: strings};
                },
                format: function(locales, options) {
                    return JSON.stringify(locales);
                }
            }
        };

        var options = this.options({
            outputFormat: 'module',
            moduleName: 'gettext'
        });

        if (!outputFormatters.hasOwnProperty(options.outputFormat)) {
            throw new Error('There is no "' + options.outputFormat + '" output format.');
        }

        var outputFormatter = outputFormatters[options.outputFormat];

        this.files.forEach(function (file) {
            var locales = [];

            file.src.forEach(function (input) {
                var data = grunt.file.read(input);
                var catalog = po.parse(data);

                if (!catalog.headers.Language) {
                    throw new Error('No Language header found!');
                }

                var strings = {};
                for (var i = 0; i < catalog.items.length; i++) {
                    var item = catalog.items[i];
                    strings[item.msgid] = item.msgstr.length === 1 ? item.msgstr[0] : item.msgstr;
                }

                locales.push(outputFormatter.addLocale(catalog.headers.Language, strings));
            });

            grunt.file.write(file.dest, outputFormatter.format(locales, options));
        });
    });
};
