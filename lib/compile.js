var po = require('pofile');
var _ = require('lodash');

var formats = {
    javascript: {
        addLocale: function (locale, strings, options) {
            return '    ' + options.catalogMarkerName + '.' + options.catalogAccessorName + '(\'' + locale + '\', ' + JSON.stringify(strings) + ');\n';
        },
        format: function (locales, options) {
            var module = 'angular.module(\'' + options.module + '\')' +
                '.run([\'' + options.catalogMarkerName + '\', function (' + options.catalogMarkerName + ') {\n' +
                '/* jshint -W100 */\n' +
                locales.join('') +
                '/* jshint +W100 */\n';
            if (options.defaultLanguage) {
                module += options.catalogMarkerName + '.currentLanguage = \'' + options.defaultLanguage + '\';\n';
            }
            module += '}]);';

            if (options.requirejs) {
                return 'define([\'angular\', \'' + options.modulePath + '\'], function (angular) {\n' + module + '\n});';
            }

            return module;
        }
    },
    json: {
        addLocale: function (locale, strings) {
            return {
                name: locale,
                strings: strings
            };
        },
        format: function (locales, options) {
            var result = {};
            locales.forEach(function (locale) {
                if (!result[locale.name]) {
                    result[locale.name] = {};
                }
                _.assign(result[locale.name], locale.strings);
            });
            return JSON.stringify(result);
        }
    }
};

var Compiler = (function () {
    function Compiler(options) {
        this.options = _.extend({
            format: 'javascript',
            module: 'gettext',
            catalogMarkerName: 'gettextCatalog',
            catalogAccessorName: 'setStrings'
        }, options);
    }

    Compiler.hasFormat = function (format) {
        return formats.hasOwnProperty(format);
    };

    Compiler.prototype.convertPo = function (inputs) {
        var format = formats[this.options.format];
        var locales = [];

        var self = this;
        inputs.forEach(function (input) {
            var catalog = po.parse(input);

            if (!catalog.headers.Language) {
                throw new Error('No Language header found!');
            }

            var strings = {};
            for (var i = 0; i < catalog.items.length; i++) {
                var item = catalog.items[i];
                if (item.msgstr[0].length > 0 && !item.flags.fuzzy) {
                    strings[item.msgid] = item.msgstr.length === 1 ? item.msgstr[0] : item.msgstr;
                }
            }

            locales.push(format.addLocale(catalog.headers.Language, strings, self.options));

        });

        return format.format(locales, this.options);
    };

    return Compiler;
})();

module.exports = Compiler;
