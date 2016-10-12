'use strict';

var assert = require('assert');
var fs = require('fs');
var Extractor = require('..').Extractor;
var testExtract = require('./utils').testExtract;

describe('Extract', function () {
    it('Extracts strings from views', function () {
        var files = [
            'test/fixtures/single.html'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 1);
        assert.equal(catalog.items[0].msgid, 'Hello!');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/single.html:3', 'test/fixtures/single.html:4']);
    });

    it('Merges multiple views into one .pot', function () {
        var files = [
            'test/fixtures/single.html',
            'test/fixtures/second.html',
            'test/fixtures/custom.extension'
        ];
        var catalog = testExtract(files);

        var i = catalog.items;
        assert.equal(i.length, 2);
        assert.equal(i[0].msgid, 'Hello!');
        assert.equal(i[1].msgid, 'This is a test');
    });

    it('Merges duplicate strings with references', function () {
        var files = [
            'test/fixtures/single.html',
            'test/fixtures/second.html',
            'test/fixtures/custom.extension'
        ];
        var catalog = testExtract(files);

        var i = catalog.items;
        assert.equal(i.length, 2);

        assert.equal(i[0].msgid, 'Hello!');
        assert.deepEqual(i[0].references, ['test/fixtures/second.html:3', 'test/fixtures/single.html:3', 'test/fixtures/single.html:4']);

        assert.equal(i[1].msgid, 'This is a test');
        assert.deepEqual(i[1].references, ['test/fixtures/second.html:4']);
    });

    it('Works with inline templates', function () {
        var files = [
            'test/fixtures/inline-templates.html'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 1);
        assert.equal(catalog.items[0].msgid, 'Hello world!');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/inline-templates.html:4']);
    });

    it('Does not encode entities', function () {
        var files = [
            'test/fixtures/entities.html'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 3);
        assert.equal(catalog.items[0].msgid, '&amp; & &apos; \' &gt; > &lt; < &quot; "');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/entities.html:3']);

        assert.equal(catalog.items[1].msgid, '<span id="&amp; & &apos; \' &gt; > &lt; <"></span>');
        assert.equal(catalog.items[1].msgstr, '');
        assert.deepEqual(catalog.items[1].references, ['test/fixtures/entities.html:4']);

        assert.equal(catalog.items[2].msgid, '<span id="&amp; & &gt; > &lt; < &quot;"></span>');
        assert.equal(catalog.items[2].msgstr, '');
        assert.deepEqual(catalog.items[2].references, ['test/fixtures/entities.html:5']);
    });

    it('Strips whitespace around strings', function () {
        var files = [
            'test/fixtures/strip.html'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 1);
        assert.equal(catalog.items[0].msgid, 'Hello!');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/strip.html:3']);
    });

    it('Handles attribute with < or >', function () {
        var files = [
            'test/fixtures/ngif.html'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 1);
        assert.equal(catalog.items[0].msgid, 'Show {{trackcount}} song...');
        assert.equal(catalog.items[0].msgid_plural, 'Show all {{trackcount}} songs...');
        assert.equal(catalog.items[0].msgstr.length, 2);
        assert.equal(catalog.items[0].msgstr[0], '');
        assert.equal(catalog.items[0].msgstr[1], '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/ngif.html:3']);
    });

    it('Can customize delimiters', function () {
        var files = [
            'test/fixtures/delim.html'
        ];
        var catalog = testExtract(files, {
            startDelim: '[[',
            endDelim: ']]'
        });

        assert.equal(catalog.items.length, 1);
        assert.equal(catalog.items[0].msgid, 'Hello');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/delim.html:3']);
    });

    it('Sorts strings', function () {
        var files = [
            'test/fixtures/sort.html'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 6);
        assert.equal(catalog.items[0].msgid, 'a');
        assert.equal(catalog.items[1].msgid, 'b');
        assert.equal(catalog.items[2].msgid, 'c');
        assert.equal(catalog.items[3].msgid, 'd');
        assert.equal(catalog.items[3].msgctxt, null);
        assert.equal(catalog.items[4].msgid, 'd');
        assert.equal(catalog.items[4].msgctxt, 'a');
        assert.equal(catalog.items[5].msgid, 'd');
        assert.equal(catalog.items[5].msgctxt, 'b');
    });

    it('Extracts strings concatenation from JavaScript source', function () {
        var files = [
            'test/fixtures/concat.js'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 2);
        assert.equal(catalog.items[0].msgid, 'Hello one concat!');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/concat.js:2']);

        assert.equal(catalog.items[1].msgid, 'Hello two concat!');
        assert.equal(catalog.items[1].msgstr, '');
        assert.deepEqual(catalog.items[1].references, ['test/fixtures/concat.js:3']);
    });

    it('Supports data-translate for old-school HTML style', function () {
        var files = [
            'test/fixtures/data.html'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 6);

        assert.equal(catalog.items[0].msgid, '1: Hello!');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/data.html:3']);

        assert.equal(catalog.items[1].msgid, '2: with comment');
        assert.equal(catalog.items[1].msgstr, '');
        assert.deepEqual(catalog.items[1].references, ['test/fixtures/data.html:4']);
        assert.deepEqual(catalog.items[1].extractedComments, ['comment']);

        assert.equal(catalog.items[2].msgid, '3: with data-comment');
        assert.equal(catalog.items[2].msgstr, '');
        assert.deepEqual(catalog.items[2].references, ['test/fixtures/data.html:5']);
        assert.deepEqual(catalog.items[2].extractedComments, ['comment']);

        assert.equal(catalog.items[3].msgid, '4: translate with data-comment');
        assert.equal(catalog.items[3].msgstr, '');
        assert.deepEqual(catalog.items[3].references, ['test/fixtures/data.html:6']);
        assert.deepEqual(catalog.items[3].extractedComments, ['comment']);

        assert.equal(catalog.items[4].msgid, '5: translate with data-plural');
        assert.deepEqual(catalog.items[4].msgstr, ['', '']);
        assert.deepEqual(catalog.items[4].references, ['test/fixtures/data.html:7']);
        assert.equal(catalog.items[4].msgid_plural, 'foos');

        assert.equal(catalog.items[5].msgid, '6: data-translate with data-plural');
        assert.deepEqual(catalog.items[5].msgstr, ['', '']);
        assert.deepEqual(catalog.items[5].references, ['test/fixtures/data.html:10']);
        assert.equal(catalog.items[5].msgid_plural, 'foos');
    });

    it('Extracts strings from non-delimited attribute', function () {
        var files = [
            'test/fixtures/no_delimiter.html'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 3);
        assert.equal(catalog.items[0].msgid, 'Click to upload file');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/no_delimiter.html:3']);

        assert.equal(catalog.items[1].msgid, 'Selected a file to upload!');
        assert.equal(catalog.items[1].msgstr, '');
        assert.deepEqual(catalog.items[1].references, ['test/fixtures/no_delimiter.html:5']);
    });

    it('Extracts strings from <translate> element', function () {
        var files = [
            'test/fixtures/translate-element.html'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 2);

        assert.equal(catalog.items[0].msgid, '1: message');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/translate-element.html:1']);
        assert.deepEqual(catalog.items[0].extractedComments, []);

        assert.equal(catalog.items[1].msgid, '2: message with comment and plural');
        assert.equal(catalog.items[1].msgid_plural, 'foos');
        assert.deepEqual(catalog.items[1].msgstr, ['', '']);
        assert.deepEqual(catalog.items[1].references, ['test/fixtures/translate-element.html:2']);
        assert.deepEqual(catalog.items[1].extractedComments, ['comment']);
    });

    it('Can customize the marker name', function () {
        var files = [
            'test/fixtures/custom_marker_name.js'
        ];
        var catalog = testExtract(files, {
            markerName: '__'
        });

        assert.equal(catalog.items.length, 1);
        assert.equal(catalog.items[0].msgid, 'Hello custom');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/custom_marker_name.js:4']);
    });

    it('Can customize multiple marker name functions', function () {
        var files = [
            'test/fixtures/custom_marker_names.js'
        ];
        var catalog = testExtract(files, { markerNames: ['showError', 'showSuccess'] });

        assert.equal(catalog.items.length, 3);

        assert.equal(catalog.items[0].msgid, 'Hello default');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/custom_marker_names.js:2']);

        assert.equal(catalog.items[1].msgid, 'Hello first custom');
        assert.equal(catalog.items[1].msgstr, '');
        assert.deepEqual(catalog.items[1].references, ['test/fixtures/custom_marker_names.js:6']);

        assert.equal(catalog.items[2].msgid, 'Hello second custom');
        assert.equal(catalog.items[2].msgstr, '');
        assert.deepEqual(catalog.items[2].references, ['test/fixtures/custom_marker_names.js:7']);
    });

    it('Can post-process the catalog', function () {
        var called = false;

        var files = [
            'test/fixtures/single.html'
        ];
        var catalog = testExtract(files, {
            postProcess: function (po) {
                called = true;
                po.headers.Test = 'Test';
            }
        });

        assert.equal(catalog.items.length, 1);
        assert.equal(catalog.items[0].msgid, 'Hello!');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/single.html:3', 'test/fixtures/single.html:4']);
        assert.equal(catalog.headers.Test, 'Test');
        assert(called);
    });

    it('Does not create empty-keyed items', function () {
        var files = [
            'test/fixtures/empty.html'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 0);
    });

    // see https://github.com/rubenv/angular-gettext/issues/60
    it('Adds Project-Id-Version header', function () {
        // can't use PO.parse b/c that sets headers for us
        var extractor = new Extractor();
        var filename = 'test/fixtures/single.html';
        extractor.parse(filename, fs.readFileSync(filename, 'utf8'));
        var poText = extractor.toString();
        assert.equal(/\n"Project-Id-Version: \\n"\n/.test(poText), true);
    });

    it('Supports Angular 1.3 bind once syntax', function () {
        var files = [
            'test/fixtures/bind-once.html'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 4);

        assert.equal(catalog.items[0].msgid, '0: no space');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/bind-once.html:1']);

        assert.equal(catalog.items[1].msgid, '1: trailing space');
        assert.equal(catalog.items[1].msgstr, '');
        assert.deepEqual(catalog.items[1].references, ['test/fixtures/bind-once.html:2']);

        assert.equal(catalog.items[2].msgid, '2: leading space');
        assert.equal(catalog.items[2].msgstr, '');
        assert.deepEqual(catalog.items[2].references, ['test/fixtures/bind-once.html:3']);

        assert.equal(catalog.items[3].msgid, '3: leading and trailing space');
        assert.equal(catalog.items[3].msgstr, '');
        assert.deepEqual(catalog.items[3].references, ['test/fixtures/bind-once.html:4']);
    });

    it('Should extract context from HTML', function () {
        var files = [
            'test/fixtures/context.html'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 2);

        assert.equal(catalog.items[0].msgid, 'Hello!');
        assert.equal(catalog.items[0].msgstr, '');
        assert.strictEqual(catalog.items[0].msgctxt, null);

        assert.equal(catalog.items[1].msgid, 'Hello!');
        assert.equal(catalog.items[1].msgstr, '');
        assert.equal(catalog.items[1].msgctxt, 'male');
    });

    it('Should extract context of custom element attribute from HTM, including attribute as element', function () {
        var files = [
            'test/fixtures/context-custom.html'
        ];
        var catalog = testExtract(files, {
            attribute: 'trans'
        });

        assert.equal(catalog.items.length, 4);

        assert.equal(catalog.items[0].msgid, 'CrazyMe!');
        assert.equal(catalog.items[0].msgstr, '');
        assert.equal(catalog.items[0].msgctxt, 'male');

        assert.equal(catalog.items[1].msgid, 'CrazyYou!');
        assert.equal(catalog.items[1].msgstr, '');
        assert.strictEqual(catalog.items[1].msgctxt, null);

        assert.equal(catalog.items[2].msgid, 'Hello1!');
        assert.equal(catalog.items[2].msgstr, '');
        assert.strictEqual(catalog.items[2].msgctxt, null);

        assert.equal(catalog.items[3].msgid, 'Hello2!');
        assert.equal(catalog.items[3].msgstr, '');
        assert.equal(catalog.items[3].msgctxt, 'male');
    });

    it('Extracts strings from an ES6 class', function () {
        var files = [
            'test/fixtures/es6-class.js'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 1);
        assert.equal(catalog.items[0].msgid, 'Hi from an ES6 class!');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/es6-class.js:5']);
    });

    it('Should extract custom attributes from HTML', function () {
        var files = [
            'test/fixtures/custom-attribute.html'
        ];
        var catalog = testExtract(files, {
            attributes: ['custom-attr']
        });

        assert.equal(catalog.items.length, 2);

        assert.equal(catalog.items[0].msgid, 'Bye!');
        assert.equal(catalog.items[0].msgstr, '');

        assert.equal(catalog.items[1].msgid, 'Hello!');
        assert.equal(catalog.items[1].msgstr, '');
    });

    it('Extracts strings from an ES6 export', function () {
        var files = [
            'test/fixtures/es6-export.js'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 2);

        assert.equal(catalog.items[0].msgid, 'Hi from an ES6 export default!');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/es6-export.js:6']);

        assert.equal(catalog.items[1].msgid, 'Hi from an ES6 export!');
        assert.equal(catalog.items[1].msgstr, '');
        assert.deepEqual(catalog.items[1].references, ['test/fixtures/es6-export.js:2']);
    });

    it('Extracts strings from an ES6 import', function () {
        var files = [
            'test/fixtures/es6-import.js'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 1);

        assert.equal(catalog.items[0].msgid, 'Hi from ES6 file with import!');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/es6-import.js:5']);
    });
});
