assert = require 'assert'
PO = require 'pofile'
fs = require 'fs'
Extractor = require('..').Extractor

testExtract = (filenames, options) ->
    extractor = new Extractor(options)
    for filename in filenames
        extractor.parse(filename, fs.readFileSync(filename, 'utf8'))

    return PO.parse(extractor.toString())

describe 'Extract', ->
    it 'Extracts strings from views', ->
        files = [
            'test/fixtures/single.html'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 1)
        assert.equal(catalog.items[0].msgid, 'Hello!')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/single.html')

    it 'Merges multiple views into one .pot', ->
        files = [
            'test/fixtures/single.html'
            'test/fixtures/second.html'
            'test/fixtures/custom.extension'
        ]
        catalog = testExtract(files)

        i = catalog.items
        assert.equal(i.length, 2)
        assert.equal(i[0].msgid, 'Hello!')
        assert.equal(i[1].msgid, 'This is a test')

    it 'Merges duplicate strings with references', ->
        files = [
            'test/fixtures/single.html'
            'test/fixtures/second.html'
            'test/fixtures/custom.extension'
        ]
        catalog = testExtract(files)

        i = catalog.items
        assert.equal(i.length, 2)

        assert.equal(i[0].msgid, 'Hello!')
        assert.equal(i[0].references.length, 2)
        assert.equal(i[0].references[0], 'test/fixtures/single.html')
        assert.equal(i[0].references[1], 'test/fixtures/second.html')

        assert.equal(i[1].msgid, 'This is a test')
        assert.equal(i[1].references.length, 1)
        assert.equal(i[1].references[0], 'test/fixtures/second.html')

    it 'Extracts plural strings', ->
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

    it 'Extracts comment strings', ->
        files = [
            'test/fixtures/comments.html'
        ]
        catalog = testExtract(files)

        i = catalog.items
        assert.equal(i.length, 1)

        assert.equal(i[0].msgid, 'Translate this')
        assert.equal(i[0].extractedComments, 'This is a comment')

    it 'Extracts comment strings from JavaScript source', ->
        files = [
            'test/fixtures/comments.js'
        ]
        catalog = testExtract(files)

        i = catalog.items

        assert.equal(i.length, 4)

        assert.equal(i[0].msgid, 'Bird')
        assert.equal(i[0].extractedComments, 'Plural Comments')

        assert.equal(i[1].msgid, 'No comment')
        assert.equal(i[1].extractedComments, '')

        assert.equal(i[2].msgid, 'Translate this')
        assert.equal(i[2].extractedComments, 'This is a comment')

        assert.equal(i[3].msgid, 'Two Part Comment')
        assert.equal(i[3].extractedComments, 'This is two part comment,Second part')

    it 'Merges singular and plural strings', ->
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

    it 'Warns for incompatible plurals', ->
        files = [
            'test/fixtures/corrupt.html'
        ]
        assert.throws ->
            testExtract(files)

    it 'Extracts filter strings', ->
        files = [
            'test/fixtures/filter.html'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 2)
        assert.equal(catalog.items[0].msgid, 'Hello')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/filter.html')

        assert.equal(catalog.items[1].msgid, 'Second')
        assert.equal(catalog.items[1].msgstr, '')
        assert.equal(catalog.items[1].references.length, 1)
        assert.equal(catalog.items[1].references[0], 'test/fixtures/filter.html')

    it 'Extracts concatenated filter strings', ->
        files = [
            'test/fixtures/multifilter.html'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 2)
        assert.equal(catalog.items[0].msgid, 'Hello')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/multifilter.html')

        assert.equal(catalog.items[1].msgid, 'Second')
        assert.equal(catalog.items[1].msgstr, '')
        assert.equal(catalog.items[1].references.length, 1)
        assert.equal(catalog.items[1].references[0], 'test/fixtures/multifilter.html')

    it 'Extracts flagged strings from JavaScript source', ->
        files = [
            'test/fixtures/source.js'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 1)
        assert.equal(catalog.items[0].msgid, 'Hello')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/source.js')

    it 'Extracts strings from calls to gettextCatalog', ->
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
        assert.equal(catalog.items[0].references[0], 'test/fixtures/catalog.js')
        assert.equal(catalog.items.length, 2)
        assert.equal(catalog.items[1].msgid, 'Hello')
        assert.equal(catalog.items[1].msgstr, '')
        assert.equal(catalog.items[1].references.length, 1)
        assert.equal(catalog.items[1].references[0], 'test/fixtures/catalog.js')

    it 'Extracts strings from deep path calls to obj.gettextCatalog', ->
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
        assert.equal(catalog.items[0].references[0], 'test/fixtures/deeppath_catalog.js')
        assert.equal(catalog.items.length, 2)
        assert.equal(catalog.items[1].msgid, 'Hello')
        assert.equal(catalog.items[1].msgstr, '')
        assert.equal(catalog.items[1].references.length, 1)
        assert.equal(catalog.items[1].references[0], 'test/fixtures/deeppath_catalog.js')

    it 'Extracts strings with quotes', ->
        files = [
            'test/fixtures/quotes.html'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 1)
        assert.equal(catalog.items[0].msgid, 'Hello "world"!')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/quotes.html')

    it 'Strips whitespace around strings', ->
        files = [
            'test/fixtures/strip.html'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 1)
        assert.equal(catalog.items[0].msgid, 'Hello!')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/strip.html')

    it 'Handles attribute with < or >', ->
        files = [
            'test/fixtures/ngif.html'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 1)
        assert.equal(catalog.items[0].msgid, 'Show {{trackcount}} song...')
        assert.equal(catalog.items[0].msgid_plural, 'Show all {{trackcount}} songs...')
        assert.equal(catalog.items[0].msgstr.length, 2)
        assert.equal(catalog.items[0].msgstr[0], '')
        assert.equal(catalog.items[0].msgstr[1], '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/ngif.html')

    it 'Can customize delimiters', ->
        files = [
            'test/fixtures/delim.html'
        ]
        catalog = testExtract(files, {
            startDelim: '[['
            endDelim: ']]'
        })

        assert.equal(catalog.items.length, 1)
        assert.equal(catalog.items[0].msgid, 'Hello')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/delim.html')

    it 'Can extract from PHP files', ->
        files = [
            'test/fixtures/php.php'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 1)
        assert.equal(catalog.items[0].msgid, 'Play')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/php.php')

    it 'Sorts strings', ->
        files = [
            'test/fixtures/sort.html'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 3)
        assert.equal(catalog.items[0].msgid, 'a')
        assert.equal(catalog.items[1].msgid, 'b')
        assert.equal(catalog.items[2].msgid, 'c')

    it 'Extracts strings concatenation from JavaScript source', ->
        files = [
            'test/fixtures/concat.js'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 2)
        assert.equal(catalog.items[0].msgid, 'Hello one concat!')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/concat.js')

        assert.equal(catalog.items[1].msgid, 'Hello two concat!')
        assert.equal(catalog.items[1].msgstr, '')
        assert.equal(catalog.items[1].references.length, 1)
        assert.equal(catalog.items[1].references[0], 'test/fixtures/concat.js')

    it 'Support data-translate for old-school HTML style', ->
        files = [
            'test/fixtures/data.html'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 1)
        assert.equal(catalog.items[0].msgid, 'Hello!')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/data.html')

    it 'Extract strings from custom HTML file extensions', ->
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
        assert.equal(catalog.items[0].references[0], 'test/fixtures/custom.extension')

    it 'Extract strings from custom JS file extensions', ->
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
        assert.equal(catalog.items[0].references[0], 'test/fixtures/custom.js_extension')

    it 'Extracts strings from non-delimited attribute', ->
        files = [
            'test/fixtures/no_delimiter.html'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 3)
        assert.equal(catalog.items[0].msgid, 'Click to upload file')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/no_delimiter.html')

        assert.equal(catalog.items[1].msgid, 'Selected a file to upload!')
        assert.equal(catalog.items[1].msgstr, '')
        assert.equal(catalog.items[1].references.length, 1)
        assert.equal(catalog.items[1].references[0], 'test/fixtures/no_delimiter.html')

    it 'Can customize the marker name', ->
        files = [
            'test/fixtures/custom_marker_name.js'
        ]
        catalog = testExtract(files, {
            markerName: '__'
        })

        assert.equal(catalog.items.length, 1)
        assert.equal(catalog.items[0].msgid, 'Hello custom')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/custom_marker_name.js')

    it 'Can post-process the catalog', ->
        called = false

        files = [
            'test/fixtures/single.html'
        ]
        catalog = testExtract(files, {
            postProcess: (po) ->
                called = true
                po.headers.Test = 'Test'
        })

        assert.equal(catalog.items.length, 1)
        assert.equal(catalog.items[0].msgid, 'Hello!')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/single.html')
        assert.equal(catalog.headers.Test, 'Test')
        assert(called)

    it 'Can extract tapestry files', () ->
        files = [
            'test/fixtures/tapestry.tml'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 1)
        assert.equal(catalog.items[0].msgid, 'Bonjour from HelloWorld component.')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/tapestry.tml')
