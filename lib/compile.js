'use strict';

var po = require('pofile');
var _ = require('lodash');

var formats = {
    javascript: {
        addLocale: function (locale, strings) {
            return '    gettextCatalog.setStrings(\'' + locale + '\', ' + JSON.stringify(strings) + ');\n';
        },
        format: function (locales, options) {
            var module = 'angular.module(\'' + options.module + '\')' +
                            '.run([\'gettextCatalog\', function (gettextCatalog) {\n' +
                                '/* jshint -W100 */\n' +
                                locales.join('') +
                                '/* jshint +W100 */\n';
            if (options.defaultLanguage) {
                module += 'gettextCatalog.currentLanguage = \'' + options.defaultLanguage + '\';\n';
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
    },
    csharp: {
        addLocale: function (locale, strings) {
            var result = 'var dictionary' + locale + ' = new Dictionary<string, string>();\n';
            for (var key in strings) {
                //supports only singular
                if (Object.prototype.toString.call(strings[key]) === '[object Array]') {
                    strings[key] = strings[key][0];
                }
                // escape quotes and new lines in order to compile in c# code
                var value = strings[key].replace(/(\\)?"/g, function ($0, $1) { return $1 ? $0 : '\\"'; });
                value = value.replace(/[\n\r]/g, ' ');
                key = key.replace(/(\\)?"/g, function ($0, $1) { return $1 ? $0 : '\\"'; });
                key = key.replace(/[\n\r]/g, ' ');
                result += 'dictionary' + locale + '.Add("' + key + '","' + value + '");\n';
            }
            result += '_translations.Add("' + locale + '", dictionary' + locale + ');\n';

            return result;
        },
        format: function (locales, options) {
            var module =
                'using System;\n' +
                'using System.Collections.Generic;\n' +
                'namespace ' + options.namespace + '\n' +
                '{\n' +
                'public static class Translations' +
                '{\n' +
                'public  static readonly Dictionary<string, Dictionary<string, string>> _translations = new Dictionary<string, Dictionary<string, string>>();\n' +
                'private static Dictionary<string, string> _currentLanguage;\n' +
                'static Translations()\n' +
                '{\n' +
                locales.join('');

            if (options.defaultLanguage) {
                module += 'SetCurrentLanguage("' + options.defaultLanguage + '");\n';
            }
            module += '}\n' +
                'public static void SetCurrentLanguage(string languageCode)\n' +
                '{\n' +
                'foreach (var translation in _translations)\n' +
                '{\n' +
                'if (translation.Key != languageCode) continue;\n' +
                '_currentLanguage = translation.Value;\n' +
                'return;\n' +
                '}\n' +
                '}\n' +
                'public static string Translate(string key)\n' +
                '{\n' +
                'try\n' +
                '{\n' +
                'return _currentLanguage != null ? _currentLanguage[key] : key;\n' +
                '}\n' +
                'catch(Exception)\n' +
                '{\n' +
                'return key;\n' +
                '}\n' +
                '}\n' +
                '}\n' +
                '}\n';
            return module;
        }
    }
};

var noContext = '$$noContext';

var Compiler = (function () {
    function Compiler(options) {
        this.options = _.extend({
            format: 'javascript',
            module: 'gettext',
            namespace: 'Core.Common'
        }, options);
    }

    Compiler.hasFormat = function (format) {
        return formats.hasOwnProperty(format);
    };

    Compiler.prototype.convertPo = function (inputs, filename) {

        var format;

        if (filename) {
            var extension = filename.split('.').pop();
            format = extension === 'cs' ? formats.csharp : formats[this.options.format];
        } else {
            format = formats[this.options.format];
        }

        var locales = [];

        inputs.forEach(function (input) {
            var catalog = po.parse(input);

            if (!catalog.headers.Language) {
                throw new Error('No Language header found!');
            }

            var strings = {};
            for (var i = 0; i < catalog.items.length; i++) {
                var item = catalog.items[i];
                var ctx = item.msgctxt || noContext;
                if (item.msgstr[0].length > 0 && !item.flags.fuzzy && !item.obsolete) {
                    if (!strings[item.msgid]) {
                        strings[item.msgid] = {};
                    }

                    // Add array for plural, single string for signular.
                    strings[item.msgid][ctx] = item.msgstr.length === 1 ? item.msgstr[0] : item.msgstr;
                }
            }

            // Strip context from strings that have no context.
            for (var key in strings) {
                if (Object.keys(strings[key]).length === 1 && strings[key][noContext]) {
                    strings[key] = strings[key][noContext];
                }
            }

            locales.push(format.addLocale(catalog.headers.Language, strings));
        });

        return format.format(locales, this.options);
    };

    return Compiler;
})();

module.exports = Compiler;
