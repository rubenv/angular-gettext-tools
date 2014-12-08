
assert = require('assert')
testExtract = require('./utils').testExtract

describe 'Extracting files with different extensions', ->

    it 'supports custom HTML file extensions', ->
        files = [
            'test/fixtures/custom.extension'
        ]
        catalog = testExtract(files, {
            extensions:
                extension: 'html'
        })

        assert.equal(catalog.items.length, 2)
        assert.equal(catalog.items[0].msgid, 'Custom file!')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/custom.extension:3')

    it 'supports custom JS file extensions', ->
        files = [
            'test/fixtures/custom.js_extension'
        ]
        catalog = testExtract(files, {
            extensions:
                js_extension: 'js'
        })

        assert.equal(catalog.items.length, 1)
        assert.equal(catalog.items[0].msgid, 'Hello custom')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/custom.js_extension:2')

    it 'supports PHP files', ->
        files = [
            'test/fixtures/php.php'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 1)
        assert.equal(catalog.items[0].msgid, 'Play')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/php.php:2')

    it 'supports ERB files', ->
        files = [
            'test/fixtures/erb.erb'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 1)
        assert.equal(catalog.items[0].msgid, 'message')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/erb.erb:3')

    it 'supports tapestry files', () ->
        files = [
            'test/fixtures/tapestry.tml'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 1)
        assert.equal(catalog.items[0].msgid, 'Bonjour from HelloWorld component.')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/tapestry.tml:2')
