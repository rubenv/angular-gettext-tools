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

        assert.equal(i.length, 8)

        assert.equal(i[0].msgid, '0: Translate this')
        assert.equal(i[0].extractedComments, 'This is a comment')

        assert.equal(i[1].msgid, '1: Two Part Comment')
        assert.equal(i[1].extractedComments, 'This is two part comment,Second part')

        assert.equal(i[2].msgid, '2: No comment')
        assert.equal(i[2].extractedComments, '')

        assert.equal(i[3].msgid, '3: Bird')
        assert.equal(i[3].extractedComments, 'Plural Comments')

        assert.equal(i[4].msgid, '4: gettextCatalog.getString comment')
        assert.equal(i[4].extractedComments, 'gettextCatalog.getString() comment')

        assert.equal(i[5].msgid, '5: gettext inside array')
        assert.equal(i[5].extractedComments, 'gettext inside array')

        assert.equal(i[6].msgid, '6: gettextCatalog inside array')
        assert.equal(i[6].extractedComments, 'gettextCatalog inside array')

        assert.equal(i[7].msgid, '7: gettextCatalog(gettext) inside array')
        assert.equal(i[7].extractedComments, 'gettextCatalog(gettext) inside array')

    it 'Merges duplicate comments', ->
      files = [
          'test/fixtures/duplicate-comments.html'
      ]
      catalog = testExtract(files)

      i = catalog.items
      assert.equal(i.length, 1)

      assert.equal(i[0].msgid, 'Translate this')
      assert.equal(i[0].extractedComments.length, 1)
      assert.equal(i[0].extractedComments, 'This is a comment')

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

    it 'Extracts filter strings using escaped quotes', ->
        files = [
            'test/fixtures/escaped_quotes.html'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 2)
        assert.equal(catalog.items[0].msgid, 'Hello')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/escaped_quotes.html')

        assert.equal(catalog.items[1].msgid, 'World')
        assert.equal(catalog.items[1].msgstr, '')
        assert.equal(catalog.items[1].references.length, 1)
        assert.equal(catalog.items[1].references[0], 'test/fixtures/escaped_quotes.html')

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

    it 'Extracts flagged strings from OOP Javascript source', ->
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
        assert.equal(catalog.items[0].references[0], 'test/fixtures/source-property.js')
        assert.equal(catalog.items[1].references.length, 1)
        assert.equal(catalog.items[1].references[0], 'test/fixtures/source-property.js')
        assert.equal(catalog.items[2].references.length, 1)
        assert.equal(catalog.items[2].references[0], 'test/fixtures/source-property.js')

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

    it 'Does not escape single quotes', ->
        files = [
            'test/fixtures/escaped-quotes.html'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 1)
        assert.equal(catalog.items[0].msgid, "'These quotes' should not be escaped.")
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/escaped-quotes.html')

    it 'Works with inline templates', ->
        files = [
            'test/fixtures/inline-templates.html'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 1)
        assert.equal(catalog.items[0].msgid, 'Hello world!')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/inline-templates.html')

    it 'Does not encode entities', ->
        files = [
            'test/fixtures/entities.html'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 3)
        assert.equal(catalog.items[0].msgid, '&amp; & &apos; \' &gt; > &lt; < &quot; "')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/entities.html')

        assert.equal(catalog.items[1].msgid, '<span id="&amp; & &apos; \' &gt; > &lt; <"></span>')
        assert.equal(catalog.items[1].msgstr, '')
        assert.equal(catalog.items[1].references.length, 1)
        assert.equal(catalog.items[1].references[0], 'test/fixtures/entities.html')

        assert.equal(catalog.items[2].msgid, '<span id="&amp; & &gt; > &lt; < &quot;"></span>')
        assert.equal(catalog.items[2].msgstr, '')
        assert.equal(catalog.items[2].references.length, 1)
        assert.equal(catalog.items[2].references[0], 'test/fixtures/entities.html')

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

    it 'Can extract from ERB files', ->
        files = [
            'test/fixtures/erb.erb'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 1)
        assert.equal(catalog.items[0].msgid, 'message')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/erb.erb')

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

        assert.equal(catalog.items.length, 6)

        assert.equal(catalog.items[0].msgid, '1: Hello!')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/data.html')

        assert.equal(catalog.items[1].msgid, '2: with comment')
        assert.equal(catalog.items[1].msgstr, '')
        assert.equal(catalog.items[1].references.length, 1)
        assert.equal(catalog.items[1].references[0], 'test/fixtures/data.html')
        assert.equal(catalog.items[1].extractedComments.length, 1)
        assert.equal(catalog.items[1].extractedComments[0], 'comment')

        assert.equal(catalog.items[2].msgid, '3: with data-comment')
        assert.equal(catalog.items[2].msgstr, '')
        assert.equal(catalog.items[2].references.length, 1)
        assert.equal(catalog.items[2].references[0], 'test/fixtures/data.html')
        assert.equal(catalog.items[2].extractedComments.length, 1)
        assert.equal(catalog.items[2].extractedComments[0], 'comment')

        assert.equal(catalog.items[3].msgid, '4: translate with data-comment')
        assert.equal(catalog.items[3].msgstr, '')
        assert.equal(catalog.items[3].references.length, 1)
        assert.equal(catalog.items[3].references[0], 'test/fixtures/data.html')
        assert.equal(catalog.items[3].extractedComments.length, 1)
        assert.equal(catalog.items[3].extractedComments[0], 'comment')

        assert.equal(catalog.items[4].msgid, '5: translate with data-plural')
        assert.equal(catalog.items[4].msgstr.length, 2)
        assert.equal(catalog.items[4].msgstr[0], '')
        assert.equal(catalog.items[4].msgstr[1], '')
        assert.equal(catalog.items[4].references.length, 1)
        assert.equal(catalog.items[4].references[0], 'test/fixtures/data.html')
        assert.equal(catalog.items[4].msgid_plural, 'foos')

        assert.equal(catalog.items[5].msgid, '6: data-translate with data-plural')
        assert.equal(catalog.items[5].msgstr.length, 2)
        assert.equal(catalog.items[5].msgstr[0], '')
        assert.equal(catalog.items[5].msgstr[1], '')
        assert.equal(catalog.items[5].references.length, 1)
        assert.equal(catalog.items[5].references[0], 'test/fixtures/data.html')
        assert.equal(catalog.items[5].msgid_plural, 'foos')

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

    it 'Extracts strings from <translate> element', ->
        files = [
            'test/fixtures/translate-element.html'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 2)

        assert.equal(catalog.items[0].msgid, '1: message')
        assert.equal(catalog.items[0].msgstr, '')
        assert.equal(catalog.items[0].references.length, 1)
        assert.equal(catalog.items[0].references[0], 'test/fixtures/translate-element.html')
        assert.equal(catalog.items[0].extractedComments.length, 0)

        assert.equal(catalog.items[1].msgid, '2: message with comment and plural')
        assert.equal(catalog.items[1].msgid_plural, 'foos')
        assert.equal(catalog.items[1].msgstr.length, 2)
        assert.equal(catalog.items[1].msgstr[0], '')
        assert.equal(catalog.items[1].msgstr[1], '')
        assert.equal(catalog.items[1].references.length, 1)
        assert.equal(catalog.items[1].references[0], 'test/fixtures/translate-element.html')
        assert.equal(catalog.items[1].extractedComments.length, 1)
        assert.equal(catalog.items[1].extractedComments[0], 'comment')

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

    it 'Can customize multiple marker name functions', ->
      files = [
        'test/fixtures/custom_marker_names.js'
      ]
      catalog = testExtract(files, { markerNames: ['showError', 'showSuccess'] })

      assert.equal(catalog.items.length, 3)

      assert.equal(catalog.items[0].msgid, 'Hello default')
      assert.equal(catalog.items[0].msgstr, '')
      assert.equal(catalog.items[0].references.length, 1)
      assert.equal(catalog.items[0].references[0], 'test/fixtures/custom_marker_names.js')

      assert.equal(catalog.items[1].msgid, 'Hello first custom')
      assert.equal(catalog.items[1].msgstr, '')
      assert.equal(catalog.items[1].references.length, 1)
      assert.equal(catalog.items[1].references[0], 'test/fixtures/custom_marker_names.js')

      assert.equal(catalog.items[2].msgid, 'Hello second custom')
      assert.equal(catalog.items[2].msgstr, '')
      assert.equal(catalog.items[2].references.length, 1)
      assert.equal(catalog.items[2].references[0], 'test/fixtures/custom_marker_names.js')

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

    it 'Does not create empty-keyed items', ->
        files = [
            'test/fixtures/empty.html'
        ]
        catalog = testExtract(files)

        assert.equal(catalog.items.length, 0)

    # see https://github.com/rubenv/angular-gettext/issues/60
    it 'Adds Project-Id-Version header', ->
        # can't use PO.parse b/c that sets headers for us
        extractor = new Extractor()
        filename = 'test/fixtures/single.html'
        extractor.parse(filename, fs.readFileSync(filename, 'utf8'))
        poText = extractor.toString()
        assert.equal(/\n"Project-Id-Version: \\n"\n/.test(poText), true)
