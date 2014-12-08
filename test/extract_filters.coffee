
assert = require('assert')
testExtract = require('./utils').testExtract

describe 'Extracting filters', ->

    it 'works for the simple case', ->
        files = [
            'test/fixtures/filter.html'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 2)
        assert.equal(catalog.items[0].msgid, 'Hello')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/filter.html:3')

        assert.equal(catalog.items[1].msgid, 'Second')
        assert.equal(catalog.items[1].msgstr, '')
        assert.equal(catalog.items[1].references.length, 1)
        assert.equal(catalog.items[1].references[0], 'test/fixtures/filter.html:4')

    it 'works for concatenated filter strings', ->
        files = [
            'test/fixtures/multifilter.html'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 2)
        assert.equal(catalog.items[0].msgid, 'Hello')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/multifilter.html:3')

        assert.equal(catalog.items[1].msgid, 'Second')
        assert.equal(catalog.items[1].msgstr, '')
        assert.equal(catalog.items[1].references.length, 1)
        assert.equal(catalog.items[1].references[0], 'test/fixtures/multifilter.html:4')

    it 'works on filter strings using escaped quotes', ->
        files = [
            'test/fixtures/escaped_quotes.html'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 2)
        assert.equal(catalog.items[0].msgid, 'Hello')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/escaped_quotes.html:3')

        assert.equal(catalog.items[1].msgid, 'World')
        assert.equal(catalog.items[1].msgstr, '')
        assert.equal(catalog.items[1].references.length, 1)
        assert.equal(catalog.items[1].references[0], 'test/fixtures/escaped_quotes.html:4')

