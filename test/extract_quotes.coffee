
assert = require('assert')
testExtract = require('./utils').testExtract

describe 'Extracting strings containing quotes', ->

    it 'works on HTML', ->
        files = [
            'test/fixtures/quotes.html'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 1)
        assert.equal(catalog.items[0].msgid, 'Hello "world"!')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/quotes.html:3')

    it 'does not escape single quotes', ->
        files = [
            'test/fixtures/escaped-quotes.html'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 1)
        assert.equal(catalog.items[0].msgid, "'These quotes' should not be escaped.")
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/escaped-quotes.html:3')
