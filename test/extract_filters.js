'use strict';

var assert = require('assert');
var testExtract = require('./utils').testExtract;

describe('Extracting filters', function () {

    it('works for the simple case', function () {
        var files = [
            'test/fixtures/filter.html'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 2);
        assert.equal(catalog.items[0].msgid, 'Hello');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/filter.html:3']);

        assert.equal(catalog.items[1].msgid, 'Second');
        assert.equal(catalog.items[1].msgstr, '');
        assert.equal(catalog.items[1].references.length, 1);
        assert.deepEqual(catalog.items[1].references, ['test/fixtures/filter.html:4']);
    });

    it('works for concatenated filter strings', function () {
        var files = [
            'test/fixtures/multifilter.html'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 2);
        assert.equal(catalog.items[0].msgid, 'Hello');
        assert.equal(catalog.items[0].msgstr, '');
        assert.equal(catalog.items[0].references.length, 1);
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/multifilter.html:3']);

        assert.equal(catalog.items[1].msgid, 'Second');
        assert.equal(catalog.items[1].msgstr, '');
        assert.equal(catalog.items[1].references.length, 1);
        assert.deepEqual(catalog.items[1].references, ['test/fixtures/multifilter.html:4']);
    });

    it('works on filter strings using escaped quotes', function () {
        var files = [
            'test/fixtures/escaped_quotes.html'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 2);
        assert.equal(catalog.items[0].msgid, 'Hello');
        assert.equal(catalog.items[0].msgstr, '');
        assert.equal(catalog.items[0].references.length, 1);
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/escaped_quotes.html:3']);

        assert.equal(catalog.items[1].msgid, 'World');
        assert.equal(catalog.items[1].msgstr, '');
        assert.equal(catalog.items[1].references.length, 1);
        assert.deepEqual(catalog.items[1].references, ['test/fixtures/escaped_quotes.html:4']);
    });
});
