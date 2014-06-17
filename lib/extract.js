var cheerio = require('cheerio');
var Po = require('pofile');
var esprima = require('esprima');
var _ = require('lodash');

var escapeRegex = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;

var mkAttrRegex = function (startDelim, endDelim) {
    var start = startDelim.replace(escapeRegex, '\\$&');
    var end = endDelim.replace(escapeRegex, '\\$&');

    if (start === '' && end === '') {
        start = '^';
    }

    return new RegExp(start + '\\s*(\'|"|&quot;)(.*?)\\1\\s*\\|\\s*translate\\s*(' + end + '|\\|)', 'g');
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
            extensions: {
                htm: 'html',
                html: 'html',
                php: 'html',
                phtml: 'html',
                tml: 'html',
                js: 'js'
            },
            postProcess: function (po) {}
        }, options);
        this.strings = {};
        this.attrRegex = mkAttrRegex(this.options.startDelim, this.options.endDelim);
    }

    Extractor.isValidStrategy = function (strategy) {
        return strategy === 'html' || strategy === 'js';
    };

    Extractor.mkAttrRegex = mkAttrRegex;

    Extractor.prototype.addString = function (file, string, plural, extractedComment) {
        string = string.trim();

        if (!this.strings[string]) {
            this.strings[string] = new Po.Item();
        }

        var item = this.strings[string];
        item.msgid = string;
        if (item.references.indexOf(file) < 0) {
            item.references.push(file);
        }
        if (plural && plural !== '') {
            if (item.msgid_plural && item.msgid_plural !== plural) {
                throw new Error('Incompatible plural definitions for ' + string + ': ' + item.msgid_plural + ' / ' + plural + ' (in: ' + (item.references.join(', ')) + ')');
            }
            item.msgid_plural = plural;
            item.msgstr = ['', ''];
        }
        if (extractedComment && extractedComment.length > 0) {
            item.extractedComments.push(extractedComment);
        }
    };

    Extractor.prototype.extractJs = function (filename, src) {
        var self = this;
        var syntax = esprima.parse(src, {
            tolerant: true,
            attachComment: true
        });

        function isGettext(node) {
            return node !== null &&
                node.type === 'CallExpression' &&
                node.callee !== null &&
                node.callee.name === self.options.markerName &&
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
            if (isGettext(node) || isGetString(node)) {
                str = getJSExpression(node.arguments[0]);
            } else if (isGetPlural(node)) {
                singular = getJSExpression(node.arguments[1]);
                plural = getJSExpression(node.arguments[2]);
            }
            if (str || singular) {
                if (parentComment) {
                    parentComment.leadingComments.forEach(function (comment) {
                        if (comment.value.match(/^\/ .*/)) {
                            extractedComments.push(comment.value.replace(/^\/ /, ''));
                        }
                    });
                }
                if (str) {
                    self.addString(filename, str, plural, extractedComments);
                } else if (singular) {
                    self.addString(filename, singular, plural, extractedComments);
                }
            }
        });
    };

    Extractor.prototype.extractHtml = function (filename, src) {
        var $ = cheerio.load(src);
        var self = this;

        $('*').each(function (index, n) {
            var str;
            var plural;
            var node = $(n);
            var extractedComment;

            for (var attr in node.attr()) {
                if (attr === 'translate') {
                    str = node.html();
                    plural = node.attr('translate-plural');
                    extractedComment = node.attr('translate-comment');
                    self.addString(filename, str, plural, extractedComment);
                } else if (matches = noDelimRegex.exec(node.attr(attr))) {
                    self.addString(filename, matches[2]);
                }
            }

            if (typeof node.attr('data-translate') !== 'undefined') {
                str = node.html();
                plural = node.attr('data-translate-plural');
                self.addString(filename, str, plural);
            }
        });

        var matches;
        while (matches = this.attrRegex.exec(src)) {
            this.addString(filename, matches[2]);
        }
    };

    Extractor.prototype.isSupportedByStrategy = function (strategy, extension) {
        return (extension in this.options.extensions) && (this.options.extensions[extension] === strategy);
    };

    Extractor.prototype.parse = function (filename, content) {
        var extension = filename.split('.').pop();

        if (this.isSupportedByStrategy('html', extension)) {
            this.extractHtml(filename, content);
        }
        if (this.isSupportedByStrategy('js', extension)) {
            this.extractJs(filename, content);
        }
    };

    Extractor.prototype.toString = function () {
        var catalog = new Po();

        catalog.headers = {
            'Content-Type': 'text/plain; charset=UTF-8',
            'Content-Transfer-Encoding': '8bit'
        };

        for (var key in this.strings) {
            catalog.items.push(this.strings[key]);
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
