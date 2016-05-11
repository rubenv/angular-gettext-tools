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

    it('works on filter strings in multiple expression attributes', function () {
        var files = [
            'test/fixtures/filter-in-multiple-expression-attributes.html'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 4);

        assert.equal(catalog.items[0].msgid, 'expr1');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/filter-in-multiple-expression-attributes.html:3']);

        assert.equal(catalog.items[1].msgid, 'expr2');
        assert.equal(catalog.items[1].msgstr, '');
        assert.deepEqual(catalog.items[1].references, ['test/fixtures/filter-in-multiple-expression-attributes.html:3']);

        assert.equal(catalog.items[2].msgid, 'expr3');
        assert.equal(catalog.items[2].msgstr, '');
        assert.deepEqual(catalog.items[2].references, ['test/fixtures/filter-in-multiple-expression-attributes.html:3']);

        assert.equal(catalog.items[3].msgid, 'expr4');
        assert.equal(catalog.items[3].msgstr, '');
        assert.deepEqual(catalog.items[3].references, ['test/fixtures/filter-in-multiple-expression-attributes.html:3']);
    });

    it('works for the data attribute case', function () {
        var files = [
            'test/fixtures/filter-data-attributes.html'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 4);

        assert.equal(catalog.items[0].msgid, 'label1');
        assert.equal(catalog.items[0].msgstr, '');
        assert.equal(catalog.items[0].references.length, 1);
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/filter-data-attributes.html:3']);

        assert.equal(catalog.items[1].msgid, 'label2');
        assert.equal(catalog.items[1].msgstr, '');
        assert.equal(catalog.items[1].references.length, 1);
        assert.deepEqual(catalog.items[1].references, ['test/fixtures/filter-data-attributes.html:4']);

        assert.equal(catalog.items[2].msgid, 'label3');
        assert.equal(catalog.items[2].msgstr, '');
        assert.equal(catalog.items[2].references.length, 1);
        assert.deepEqual(catalog.items[2].references, ['test/fixtures/filter-data-attributes.html:5']);

        assert.equal(catalog.items[3].msgid, 'label4');
        assert.equal(catalog.items[3].msgstr, '');
        assert.equal(catalog.items[3].references.length, 1);
        assert.deepEqual(catalog.items[3].references, ['test/fixtures/filter-data-attributes.html:6']);
    });
});
