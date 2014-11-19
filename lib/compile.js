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
    }
};

var Compiler = (function () {
    function Compiler(options) {
        this.options = _.extend({
            format: 'javascript',
            module: 'gettext'
        }, options);
    }

    Compiler.hasFormat = function (format) {
        return formats.hasOwnProperty(format);
    };

    Compiler.prototype.convertPo = function (inputs) {
        var format = formats[this.options.format];
        var locales = [];

        inputs.forEach(function (input) {
            var catalog = po.parse(input);

            if (!catalog.headers.Language) {
                throw new Error('No Language header found!');
            }

            var strings = catalog.items.reduce(function (items, item) {
                if (item.msgstr[0].length === 0 || item.flags.fuzzy) {
                    return items;
                }

                var entry;
                var msgstr = item.msgstr.length === 1 ? item.msgstr[0] : item.msgstr;
                if (item.msgctxt || item.msgctxt === '') {
                    entry = {
                        msgstr: msgstr,
                        msgctxt: item.msgctxt
                    };
                } else {
                    entry = msgstr;
                }

                if (!items[item.msgid]) {
                    items[item.msgid] = entry;
                } else if (Array.isArray(items[item.msgid])) {
                    items[item.msgid].push(entry);
                } else {
                    items[item.msgid] = [items[item.msgid]];
                    items[item.msgid].push(entry);
                }

                return items;
            }, {});

            locales.push(format.addLocale(catalog.headers.Language, strings));
        });

        return format.format(locales, this.options);
    };

    return Compiler;
})();

module.exports = Compiler;
