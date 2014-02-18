var po = require('pofile');

var formats = {
    javascript: {
        addLocale: function (locale, strings) {
            return "    gettextCatalog.setStrings('" + locale + "', " + (JSON.stringify(strings)) + ");\n";
        },
        format: function (locales, options) {
            return "angular.module(\"" + options.module + "\").run(['gettextCatalog', function (gettextCatalog) {\n" + locales.join('') + "\n}]);";
        }
    },
    json: {
        addLocale: function (locale, strings) {
            return {name: locale, strings: strings};
        },
        format: function (locales, options) {
            var result = {};
            locales.forEach(function (locale) {
                result[locale.name] = locale.strings;
            });
            return JSON.stringify(result);
        }
    }
};

module.exports = function (grunt) {
    grunt.registerMultiTask('nggettext_compile', 'Compile strings from .po files', function () {
        var options = this.options({
            format: 'javascript',
            module: 'gettext'
        });

        if (!formats.hasOwnProperty(options.format)) {
            throw new Error('There is no "' + options.format + '" output format.');
        }

        var format = formats[options.format];

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

                locales.push(format.addLocale(catalog.headers.Language, strings));
            });

            grunt.file.write(file.dest, format.format(locales, options));
        });
    });
};
