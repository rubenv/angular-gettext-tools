'use strict';

var assert = require('assert');
var testExtract = require('./utils').testExtract;

describe('Extracting from Javascript using both a custom module and custom methods', function () {
    it('supports a custom module name', function () {
        var files = [
            'test/fixtures/custom_module.js'
        ];
        var catalog = testExtract(files, {
            moduleName: 'LabelService'
        });

        assert.equal(catalog.items.length, 1);
        assert.equal(catalog.items[0].msgid, 'Hello');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/custom_module.js:2']);
    });

    it('supports a custom method name', function () {
        var files = [
            'test/fixtures/custom_method.js'
        ];
        var catalog = testExtract(files, {
            moduleMethodString: 'getTranslation'
        });

        assert.equal(catalog.items.length, 1);
        assert.equal(catalog.items[0].msgid, 'Hello');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/custom_method.js:2']);
    });
});
