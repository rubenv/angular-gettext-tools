'use strict';

var assert = require('assert');
var testExtract = require('./utils').testExtract;

describe('Extracting from C#', function () {
    it('should extract the properties having _translate sufix', function () {
        var files = [
            'test/fixtures/Constants.cs'
        ];
        var catalog = testExtract(files);

        assert.equal(catalog.items.length, 2);
        assert.equal(catalog.items[0].msgid, 'Successfully saved!');
        assert.equal(catalog.items[0].msgstr, '');
        assert.equal(catalog.items[1].msgid, 'The selected items were deleted successfully.');
        assert.equal(catalog.items[1].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/Constants.cs:14']);
        assert.deepEqual(catalog.items[1].references, ['test/fixtures/Constants.cs:16']);
    });
});