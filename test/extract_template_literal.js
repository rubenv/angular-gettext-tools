'use strict';

var assert = require('assert');
var testExtract = require('./utils').testExtract;

describe('Extracting template literal', function () {
    it('should work with separated template', function () {
        var files = [
            'test/fixtures/template-literal-separated.js'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 1);
        assert.equal(catalog.items[0].msgid, 'Hi');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/template-literal-separated.js:4']);
    });

    it('should work with components template', function () {
        var files = [
            'test/fixtures/template-literal-component.js'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 1);
        assert.equal(catalog.items[0].msgid, 'Hi');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/template-literal-component.js:11']);
    });
});
