var cheerio = require('cheerio');
var po = require('pofile');
var esprima = require('esprima');
var _ = require('lodash');

var escapeRegex = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;

var mkAttrRegex = function (startDelim, endDelim) {
    var start = startDelim.replace(escapeRegex, "\\$&");
    var end = endDelim.replace(escapeRegex, "\\$&");

    if (start === '' && end === '') {
        start = '^';
    }

    return new RegExp(start + '\\s*(\'|"|&quot;)(.*?)\\1\\s*\\|\\s*translate\\s*' + end, 'g');
};

var noDelimRegex = mkAttrRegex('', '');

function walkJs(node, fn) {
    fn(node);

    for (var key in node) {
        var obj = node[key];
        if (typeof obj === 'object') {
            walkJs(obj, fn);
        }
    }
}

function getJSExpression(node) {
    var res = "";
    if (node.type === "Literal") {
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

    Extractor.prototype.addString = function (file, string, plural) {
        string = string.trim();

        if (!this.strings[string]) {
            this.strings[string] = new po.Item();
        }

        var item = this.strings[string];
        item.msgid = string;
        if (item.references.indexOf(file) < 0) {
            item.references.push(file);
        }
        if (plural && plural !== '') {
            if (item.msgid_plural && item.msgid_plural !== plural) {
                throw new Error("Incompatible plural definitions for " + string + ": " + item.msgid_plural + " / " + plural + " (in: " + (item.references.join(", ")) + ")");
            }
            item.msgid_plural = plural;
            item.msgstr = ["", ""];
        }
    };

    Extractor.prototype.extractJs = function (filename, src) {
        var extractor = this;
        var syntax = esprima.parse(src, {
            tolerant: true
        });

        function isGettext(node) {
            return node !== null &&
                node.type === 'CallExpression' &&
                node.callee !== null &&
                node.callee.name === extractor.options.markerName &&
                node["arguments"] !== null &&
                node["arguments"].length;
        }

        function isGetString(node) {
            return node !== null &&
                node.type === 'CallExpression' &&
                node.callee !== null &&
                node.callee.type === 'MemberExpression' &&
                node.callee.object !== null &&
                node.callee.object.name === 'gettextCatalog' &&
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
                node.callee.object !== null &&
                node.callee.object.name === 'gettextCatalog' &&
                node.callee.property !== null &&
                node.callee.property.name === 'getPlural' &&
                node.arguments !== null &&
                node.arguments.length;
        }

        walkJs(syntax, function (node) {
            if (isGettext(node) || isGetString(node)) {
                var str = getJSExpression(node["arguments"][0]);
                if (str) {
                    extractor.addString(filename, str);
                }
            } else if (isGetPlural(node)) {
                var singular = getJSExpression(node["arguments"][1]);
                var plural = getJSExpression(node["arguments"][2]);
                if (singular) {
                    extractor.addString(filename, singular, plural);
                }
            }
        });
    };

    Extractor.prototype.extractHtml = function (filename, src) {
        var $ = cheerio.load(src);
        var extractor = this;

        $('*').each(function (index, n) {
            var node, plural, str, matches;
            node = $(n);

            for (var attr in node.attr()) {
                if (attr === 'translate') {
                    str = node.html();
                    plural = node.attr('translate-plural');
                    extractor.addString(filename, str, plural);
                }
                else if (matches = noDelimRegex.exec(node.attr(attr))) {
                    extractor.addString(filename, matches[2]);
                }
            }

            if (typeof node.attr('data-translate') !== 'undefined') {
                str = node.html();
                plural = node.attr('data-translate-plural');
                extractor.addString(filename, str, plural);
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
        var extension = filename.split(".").pop();

        if (this.isSupportedByStrategy("html", extension)) {
            this.extractHtml(filename, content);
        }
        if (this.isSupportedByStrategy("js", extension)) {
            this.extractJs(filename, content);
        }
    };

    Extractor.prototype.toString = function () {
        var catalog = new po();

        catalog.headers = {
            "Content-Type": "text/plain; charset=UTF-8",
            "Content-Transfer-Encoding": "8bit"
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
