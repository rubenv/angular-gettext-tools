'use strict';

var assert = require('assert');
var fs = require('fs');
var Extractor = require('..').Extractor;
var testExtract = require('./utils').testExtract;

describe('Extract', function () {
    it('Extract "constructor" from HTML', function () {
        var files = [
            'test/fixtures/issue_188.html'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 1);
        assert.equal(catalog.items[0].msgid, 'constructor');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/issue_188.html:1', 'test/fixtures/issue_188.html:2', 'test/fixtures/issue_188.html:3']);
    });

    it('Extract "constructor" from TypeScript', function () {
        var files = [
            'test/fixtures/issue_188.ts'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 1);
        assert.equal(catalog.items[0].msgid, 'constructor');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/issue_188.ts:2', 'test/fixtures/issue_188.ts:3']);
    });
});
