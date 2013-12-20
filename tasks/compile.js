var po = require('pofile');

var template = function (module, body) {
    return "angular.module(\"" + module + "\").run(['gettextCatalog', function (gettextCatalog) {\n" + body + "\n}]);";
};

var langTemplate = function (language, strings) {
    return "    gettextCatalog.setStrings('" + language + "', " + (JSON.stringify(strings)) + ");\n";
};

module.exports = function (grunt) {
    grunt.registerMultiTask('nggettext_compile', 'Compile strings from .po files', function () {
        var options = this.options({
            module: 'gettext'
        });

        this.files.forEach(function (file) {
            var body = '';

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

                body += langTemplate(catalog.headers.Language, strings);
            });

            grunt.file.write(file.dest, template(options.module, body));
        });
    });
};
