'use strict';

var assert = require('assert');
var testExtract = require('./utils').testExtract;

describe('Extracting line numbers', function () {
    it('works on Javascript', function () {
        var files = [
            'test/fixtures/line_numbers.js'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items[0].msgid, 'Line number 2');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/line_numbers.js:2']);
    });

    it('works on HTML', function () {
        var files = [
            'test/fixtures/line_numbers.html'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items[0].msgid, 'Line 1');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/line_numbers.html:1']);
    });

    it("doesn't extract line numbers from JavaScript if lineNumbers: false", function () {
        var files = [
            'test/fixtures/line_numbers.js'
        ];
        var catalog = testExtract(files, { lineNumbers: false });

        assert.equal(catalog.items[0].msgid, 'Line number 2');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/line_numbers.js']);
    });

    it("doesn't extract line numbers from HTML if lineNumbers: false", function () {
        var files = [
            'test/fixtures/line_numbers.html'
        ];
        var catalog = testExtract(files, { lineNumbers: false });

        assert.equal(catalog.items[0].msgid, 'Line 1');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/line_numbers.html']);
    });
});
