assert = require 'assert'
PO = require 'pofile'
fs = require 'fs'
Extractor = require('..').Extractor

testExtract = (filenames, options) ->
    extractor = new Extractor(options)
    for filename in filenames
        extractor.parse(filename, fs.readFileSync(filename, 'utf8'))

    return PO.parse(extractor.toString())

describe 'Extract (regression tests)', ->
    it 'Issue 23', ->
        files = [
            'test/fixtures/complete/issue23.html'
        ]
        catalog = testExtract(files)

        i = 0
        assertString = (string, plural = null) ->
            assert.equal(catalog.items[i].msgid, string)
            assert.equal(catalog.items[i].msgid_plural, plural)
            assert.equal(catalog.items[i].references.length, 1)
            assert.equal(catalog.items[i].references[0], 'test/fixtures/complete/issue23.html')
            i += 1

        assert.equal(catalog.items.length, 17)
        assertString('(Show on map)')
        assertString('Add')
        assertString('Address')
        assertString('All')
        assertString('Birth date')
        assertString('Cancel')
        assertString('Communications')
        assertString('E-mail')
        assertString('Enter your message here...')
        assertString('Log')
        assertString('Order')
        assertString('Orders')
        assertString('Personal details')
        assertString('Preferences')
        assertString('Remarks')
        assertString('Statistics')
        assertString('Subscribed to')
