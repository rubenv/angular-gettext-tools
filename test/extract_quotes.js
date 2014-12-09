'use strict';

var assert = require('assert');
var testExtract = require('./utils').testExtract;

describe('Extracting strings containing quotes', function () {
    it('works on HTML', function () {
        var files = [
            'test/fixtures/quotes.html'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 1);
        assert.equal(catalog.items[0].msgid, 'Hello "world"!');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/quotes.html:3']);
    });

    it('does not escape single quotes', function () {
        var files = [
            'test/fixtures/escaped-quotes.html'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 1);
        assert.equal(catalog.items[0].msgid, "'These quotes' should not be escaped.");
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/escaped-quotes.html:3']);
    });
});
