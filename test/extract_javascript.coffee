
assert = require('assert')
testExtract = require('./utils').testExtract

describe 'Extracting from Javascript', ->

    it 'supports gettext()', ->
        files = [
            'test/fixtures/source.js'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 1)
        assert.equal(catalog.items[0].msgid, 'Hello')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/source.js:2')

    it 'supports this.gettext()', ->
        files = [
            'test/fixtures/source-property.js'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 3)
        assert.equal(catalog.items[0].msgid, 'Hello')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[1].msgid, 'Hello world')
        assert.equal(catalog.items[1].msgstr, '')
        assert.equal(catalog.items[2].msgid, 'World')
        assert.equal(catalog.items[2].msgstr, '')

        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/source-property.js:5')
        assert.equal(catalog.items[1].references.length, 1)
        assert.equal(catalog.items[1].references[0], 'test/fixtures/source-property.js:11')
        assert.equal(catalog.items[2].references.length, 1)
        assert.equal(catalog.items[2].references[0], 'test/fixtures/source-property.js:6')

    it 'supports gettextCatalog.getString()', ->
        files = [
            'test/fixtures/catalog.js'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items[0].msgid, 'Bird')
        assert.equal(catalog.items[0].msgid_plural, 'Birds')
        assert.equal(catalog.items[0].msgstr.length, 2)
        assert.equal(catalog.items[0].msgstr[0], '')
        assert.equal(catalog.items[0].msgstr[1], '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/catalog.js:3')
        assert.equal(catalog.items.length, 2)
        assert.equal(catalog.items[1].msgid, 'Hello')
        assert.equal(catalog.items[1].msgstr, '')
        assert.equal(catalog.items[1].references.length, 1)
        assert.equal(catalog.items[1].references[0], 'test/fixtures/catalog.js:2')

    it 'supports foo.gettextCatalog.getString()', ->
        files = [
            'test/fixtures/deeppath_catalog.js'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items[0].msgid, 'Bird')
        assert.equal(catalog.items[0].msgid_plural, 'Birds')
        assert.equal(catalog.items[0].msgstr.length, 2)
        assert.equal(catalog.items[0].msgstr[0], '')
        assert.equal(catalog.items[0].msgstr[1], '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/deeppath_catalog.js:5')
        assert.equal(catalog.items.length, 2)
        assert.equal(catalog.items[1].msgid, 'Hello')
        assert.equal(catalog.items[1].msgstr, '')
        assert.equal(catalog.items[1].references.length, 1)
        assert.equal(catalog.items[1].references[0], 'test/fixtures/deeppath_catalog.js:4')
