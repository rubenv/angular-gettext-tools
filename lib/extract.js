'use strict';

var cheerio = require('cheerio');
var Po = require('pofile');
var esprima = require('esprima');
var langDetect = require('language-detect');
var langMap = require('language-map');
var _ = require('lodash');

var escapeRegex = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;
var noContext = '$$noContext';

var mkAttrRegex = function (startDelim, endDelim) {
    var start = startDelim.replace(escapeRegex, '\\$&');
    var end = endDelim.replace(escapeRegex, '\\$&');

    if (start === '' && end === '') {
        start = '^';
    } else {
        // match optional :: (Angular 1.3's bind once syntax) without capturing
        start += '(?:\\s*\\:\\:\\s*)?';
    }

    return new RegExp(start + '\\s*(\'|"|&quot;|&#39;)(.*?)\\1\\s*\\|\\s*translate\\s*(' + end + '|\\|)', 'g');
};

var noDelimRegex = mkAttrRegex('', '');

function walkJs(node, fn, parentComment) {
    fn(node, parentComment);

    for (var key in node) {
        var obj = node[key];
        if (node && node.leadingComments) {
            parentComment = node;
        }
        if (typeof obj === 'object') {
            walkJs(obj, fn, parentComment);
        }
    }
}

function getJSExpression(node) {
    var res = '';
    if (node.type === 'Literal') {
        res = node.value;
    }
    if (node.type === 'BinaryExpression' && node.operator === '+') {
        res += getJSExpression(node.left);
        res += getJSExpression(node.right);
    }
    return res;
}

var Extractor = (function () {
    function Extractor(options) {
        this.options = _.extend({
            startDelim: '{{',
            endDelim: '}}',
            markerName: 'gettext',
            markerNames: [],
            lineNumbers: true,
            extensions: {},
            postProcess: function (po) {}
        }, options);
        this.options.markerNames.unshift(this.options.markerName);

        this.strings = {};
        this.attrRegex = mkAttrRegex(this.options.startDelim, this.options.endDelim);
    }

    Extractor.isValidStrategy = function (strategy) {
        return strategy === 'html' || strategy === 'js';
    };

    Extractor.mkAttrRegex = mkAttrRegex;

    Extractor.prototype.addString = function (reference, string, plural, extractedComment, context) {
        // maintain backwards compatibility
        if (_.isString(reference)) {
            reference = { file: reference };
        }

        string = string.trim();

        if (string.length === 0) {
            return;
        }

        if (!context) {
            context = noContext;
        }

        if (!this.strings[string]) {
            this.strings[string] = {};
        }

        if (!this.strings[string][context]) {
            this.strings[string][context] = new Po.Item();
        }

        var item = this.strings[string][context];
        item.msgid = string;

        var refString = reference.file;
        if (this.options.lineNumbers && reference.location && reference.location.start) {
            var line = reference.location.start.line;
            if (line || line === 0) {
                refString += ':' + reference.location.start.line;
            }
        }

        if (item.references.indexOf(refString) < 0) {
            item.references.push(refString);
        }

        if (context !== noContext) {
            item.msgctxt = context;
        }

        if (plural && plural !== '') {
            if (item.msgid_plural && item.msgid_plural !== plural) {
                throw new Error('Incompatible plural definitions for ' + string + ': ' + item.msgid_plural + ' / ' + plural + ' (in: ' + (item.references.join(', ')) + ')');
            }
            item.msgid_plural = plural;
            item.msgstr = ['', ''];
        }

        if (extractedComment && extractedComment.length > 0 && item.extractedComments.indexOf(extractedComment) === -1) {
            item.extractedComments.push(extractedComment);
        }
    };

    Extractor.prototype.extractJs = function (filename, src) {
        var self = this;
        var syntax = esprima.parse(src, {
            tolerant: true,
            attachComment: true,
            loc: true
        });

        function isGettext(node) {
            return node !== null &&
                node.type === 'CallExpression' &&
                node.callee !== null &&
                (self.options.markerNames.indexOf(node.callee.name) > -1 || (
                    node.callee.property &&
                    self.options.markerNames.indexOf(node.callee.property.name) > -1
                )) &&
                node.arguments !== null &&
                node.arguments.length;
        }

        function isGetString(node) {
            return node !== null &&
                node.type === 'CallExpression' &&
                node.callee !== null &&
                node.callee.type === 'MemberExpression' &&
                node.callee.object !== null && (
                    node.callee.object.name === 'gettextCatalog' || (
                        // also allow gettextCatalog calls on objects like this.gettextCatalog.getString()
                        node.callee.object.property &&
                        node.callee.object.property.name === 'gettextCatalog')) &&
                node.callee.property !== null &&
                node.callee.property.name === 'getString' &&
                node.arguments !== null &&
                node.arguments.length;
        }

        function isGetPlural(node) {
            return node !== null &&
                node.type === 'CallExpression' &&
                node.callee !== null &&
                node.callee.type === 'MemberExpression' &&
                node.callee.object !== null && (
                    node.callee.object.name === 'gettextCatalog' || (
                        // also allow gettextCatalog calls on objects like this.gettextCatalog.getPlural()
                        node.callee.object.property &&
                        node.callee.object.property.name === 'gettextCatalog')) &&
                node.callee.property !== null &&
                node.callee.property.name === 'getPlural' &&
                node.arguments !== null &&
                node.arguments.length;
        }

        walkJs(syntax, function (node, parentComment) {
            var str;
            var singular;
            var plural;
            var extractedComments = [];
            var reference = { file: filename, location: node ? node.loc : null };

            if (isGettext(node) || isGetString(node)) {
                str = getJSExpression(node.arguments[0]);
            } else if (isGetPlural(node)) {
                singular = getJSExpression(node.arguments[1]);
                plural = getJSExpression(node.arguments[2]);
            }
            if (str || singular) {
                var leadingComments = node.leadingComments || (parentComment ? parentComment.leadingComments : []);
                leadingComments.forEach(function (comment) {
                    if (comment.value.match(/^\/ .*/)) {
                        extractedComments.push(comment.value.replace(/^\/ /, ''));
                    }
                });
                if (str) {
                    self.addString(reference, str, plural, extractedComments);
                } else if (singular) {
                    self.addString(reference, singular, plural, extractedComments);
                }
            }
        });
    };

    Extractor.prototype.extractHtml = function (filename, src) {
        var extractHtml = function (src, lineNumber) {
            var $ = cheerio.load(src, { decodeEntities: false, withStartIndices: true });
            var self = this;

            var newlines = function (index) {
                return src.substr(0, index).match(/\n/g) || [];
            };
            var reference = function (index) {
                return {
                    file: filename,
                    location: {
                        start: {
                            line: lineNumber + newlines(index).length + 1
                        }
                    }
                };
            };

            $('*').each(function (index, n) {
                var node = $(n);
                var getAttr = function (attr) {
                    return node.attr(attr) || node.data(attr);
                };
                var str = node.html();
                var plural = getAttr('translate-plural');
                var extractedComment = getAttr('translate-comment');
                var context = getAttr('translate-context');

                if (n.name === 'script' && n.attribs.type === 'text/ng-template') {
                    extractHtml(node.text(), newlines(n.startIndex).length);
                    return;
                }

                if (node.is('translate')) {
                    self.addString(reference(n.startIndex), str, plural, extractedComment);
                    return;
                }

                for (var attr in node.attr()) {
                    if (attr === 'translate' || attr === 'data-translate') {
                        str = node.html(); // this shouldn't be necessary, but it is
                        self.addString(reference(n.startIndex), str, plural, extractedComment, context);
                    } else if (matches = noDelimRegex.exec(node.attr(attr))) {
                        str = matches[2].replace(/\\\'/g, '\'');
                        self.addString(reference(n.startIndex), str);
                    }
                }
            });

            var matches;
            while (matches = this.attrRegex.exec(src)) {
                var str = matches[2].replace(/\\\'/g, '\'');
                this.addString(reference(matches.index), str);
            }
        }.bind(this);

        extractHtml(src, 0);
    };

    Extractor.prototype.isSupportedByStrategy = function (strategy, extension) {
        return (extension in this.options.extensions) && (this.options.extensions[extension] === strategy);
    };

    Extractor.prototype.parse = function (filename, content) {
        // check list of supported extensions
        var extension = filename.split('.').pop();
        if (this.isSupportedByStrategy('html', extension)) {
            return this.extractHtml(filename, content);
        } else if (this.isSupportedByStrategy('js', extension)) {
            return this.extractJs(filename, content);
        }

        // better language detection when all else fails
        var lang = langDetect.filename(filename) || langDetect.classify(content);
        if (lang === 'JavaScript') {
            this.extractJs(filename, content);
        } else {
            var langAttrs = langMap[lang];
            if (langAttrs.type === 'markup' || // covers HTML, most templating langs, and XML
                lang === 'PHP' ||
                extension.indexOf('html') !== -1) /* .cshtml */ {

                this.extractHtml(filename, content);
            }
        }
    };

    Extractor.prototype.toString = function () {
        var catalog = new Po();

        catalog.headers = {
            'Content-Type': 'text/plain; charset=UTF-8',
            'Content-Transfer-Encoding': '8bit',
            'Project-Id-Version': ''
        };

        for (var msgstr in this.strings) {
            var msg = this.strings[msgstr];
            var contexts = Object.keys(msg).sort();
            for (var i = 0; i < contexts.length; i++) {
                catalog.items.push(msg[contexts[i]]);
            }
        }

        catalog.items.sort(function (a, b) {
            return a.msgid.localeCompare(b.msgid);
        });

        this.options.postProcess(catalog);

        return catalog.toString();
    };

    return Extractor;
})();

module.exports = Extractor;
