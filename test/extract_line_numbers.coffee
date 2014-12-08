
assert = require('assert')
testExtract = require('./utils').testExtract

describe 'Extracting line numbers', ->

    it 'works on Javascript', ->
        files = [
            'test/fixtures/line_numbers.js'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items[0].msgid, 'Line number 2')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/line_numbers.js:2')

    it 'works on HTML', ->
        files = [
            'test/fixtures/line_numbers.html'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items[0].msgid, 'Line 1')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/line_numbers.html:1')

    it "doesn't extract line numbers from JavaScript if lineNumbers: false", ->
        files = [
            'test/fixtures/line_numbers.js'
        ]
        catalog = testExtract(files, { lineNumbers: false })

        assert.equal(catalog.items[0].msgid, 'Line number 2')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/line_numbers.js')

    it "doesn't extract line numbers from HTML if lineNumbers: false", ->
        files = [
            'test/fixtures/line_numbers.html'
        ]
        catalog = testExtract(files, { lineNumbers: false })

        assert.equal(catalog.items[0].msgid, 'Line 1')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/line_numbers.html')
