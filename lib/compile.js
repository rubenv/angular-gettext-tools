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

            var strings = {};
            for (var i = 0; i < catalog.items.length; i++) {
                var item = catalog.items[i];
                if (item.msgstr[0].length > 0 && !item.flags.fuzzy) {
                    var translation = item.msgstr.length === 1 ? item.msgstr[0] : item.msgstr;
                    if (item.msgctxt ||
                        _.isPlainObject(strings[item.msgid])){
                        var translationContext = {};
                        if (item.msgctxt){
                            translationContext[item.msgctxt] = translation;
                        }
                        if (_.isPlainObject(strings[item.msgid])){
                            strings[item.msgid] =  _.extend(strings[item.msgid], translationContext);
                        } else {
                            strings[item.msgid] = translationContext;
                        }
                    } else {
                        strings[item.msgid] = translation;
                    }
                }
            }

            locales.push(format.addLocale(catalog.headers.Language, strings));

        });

        return format.format(locales, this.options);
    };

    return Compiler;
})();

module.exports = Compiler;
