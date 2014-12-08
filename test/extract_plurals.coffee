
assert = require('assert')
testExtract = require('./utils').testExtract

describe 'Extracting plurals', ->

    it 'works on HTML', ->
        files = [
            'test/fixtures/plural.html'
        ]
        catalog = testExtract(files)

        i = catalog.items
        assert.equal(i.length, 1)

        assert.equal(i[0].msgid, 'Bird')
        assert.equal(i[0].msgid_plural, 'Birds')
        assert.equal(i[0].msgstr.length, 2)
        assert.equal(i[0].msgstr[0], '')
        assert.equal(i[0].msgstr[1], '')

    it 'merges singular and plural strings', ->
        files = [
            'test/fixtures/merge.html'
        ]
        catalog = testExtract(files)

        i = catalog.items
        assert.equal(i.length, 1)

        assert.equal(i[0].msgid, 'Bird')
        assert.equal(i[0].msgid_plural, 'Birds')
        assert.equal(i[0].msgstr.length, 2)
        assert.equal(i[0].msgstr[0], '')
        assert.equal(i[0].msgstr[1], '')

    it 'warns for incompatible plurals', ->
        files = [
            'test/fixtures/corrupt.html'
        ]
        assert.throws ->
            testExtract(files)

