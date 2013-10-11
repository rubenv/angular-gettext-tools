assert = require 'assert'
po = require 'node-po'
fs = require 'fs'
grunt = require 'grunt'

describe 'Extract', ->
    it 'Extracts strings from views', (done) ->
        assert(fs.existsSync('tmp/test1.pot'))

        po.load 'tmp/test1.pot', (catalog) ->
            assert.equal(catalog.items.length, 1)
            assert.equal(catalog.items[0].msgid, 'Hello!')
            assert.equal(catalog.items[0].msgstr, '')
            assert.equal(catalog.items[0].references.length, 1)
            assert.equal(catalog.items[0].references[0], 'test/fixtures/single.html')
            done()

    it 'Merges multiple views into one .pot', (done) ->
        assert(fs.existsSync('tmp/test2.pot'))

        po.load 'tmp/test2.pot', (catalog) ->
            i = catalog.items
            assert.equal(i.length, 2)
            assert.equal(i[0].msgid, 'Hello!')
            assert.equal(i[1].msgid, 'This is a test')
            done()

    it 'Merges duplicate strings with references', (done) ->
        assert(fs.existsSync('tmp/test2.pot'))

        po.load 'tmp/test2.pot', (catalog) ->
            i = catalog.items
            assert.equal(i.length, 2)

            assert.equal(i[0].msgid, 'Hello!')
            assert.equal(i[0].references.length, 2)
            assert.equal(i[0].references[0], 'test/fixtures/single.html')
            assert.equal(i[0].references[1], 'test/fixtures/second.html')

            assert.equal(i[1].msgid, 'This is a test')
            assert.equal(i[1].references.length, 1)
            assert.equal(i[1].references[0], 'test/fixtures/second.html')
            done()

    it 'Extracts plural strings', (done) ->
        assert(fs.existsSync('tmp/test3.pot'))

        po.load 'tmp/test3.pot', (catalog) ->
            i = catalog.items
            assert.equal(i.length, 1)

            assert.equal(i[0].msgid, 'Bird')
            assert.equal(i[0].msgid_plural, 'Birds')
            assert.equal(i[0].msgstr.length, 2)
            assert.equal(i[0].msgstr[0], '')
            assert.equal(i[0].msgstr[1], '')
            done()

    it 'Merges singular and plural strings', (done) ->
        assert(fs.existsSync('tmp/test4.pot'))

        po.load 'tmp/test4.pot', (catalog) ->
            i = catalog.items
            assert.equal(i.length, 1)

            assert.equal(i[0].msgid, 'Bird')
            assert.equal(i[0].msgid_plural, 'Birds')
            assert.equal(i[0].msgstr.length, 2)
            assert.equal(i[0].msgstr[0], '')
            assert.equal(i[0].msgstr[1], '')
            done()

    it 'Warns for incompatible plurals', (done) ->
        grunt.util.spawn {
            cmd: "grunt",
            args: ["nggettext_extract:manual"]
        }, (err) ->
            assert(!fs.existsSync('tmp/test5.pot'))
            done(err)

    it 'Extracts filter strings', (done) ->
        assert(fs.existsSync('tmp/test6.pot'))

        po.load 'tmp/test6.pot', (catalog) ->
            assert.equal(catalog.items.length, 2)
            assert.equal(catalog.items[0].msgid, 'Hello')
            assert.equal(catalog.items[0].msgstr, '')
            assert.equal(catalog.items[0].references.length, 1)
            assert.equal(catalog.items[0].references[0], 'test/fixtures/filter.html')

            assert.equal(catalog.items[1].msgid, 'Second')
            assert.equal(catalog.items[1].msgstr, '')
            assert.equal(catalog.items[1].references.length, 1)
            assert.equal(catalog.items[1].references[0], 'test/fixtures/filter.html')
            done()

    it 'Extracts flagged strings from JavaScript source', (done) ->
        assert(fs.existsSync('tmp/test7.pot'))

        po.load 'tmp/test7.pot', (catalog) ->
            assert.equal(catalog.items.length, 1)
            assert.equal(catalog.items[0].msgid, 'Hello')
            assert.equal(catalog.items[0].msgstr, '')
            assert.equal(catalog.items[0].references.length, 1)
            assert.equal(catalog.items[0].references[0], 'test/fixtures/source.js')
            done()

    it 'Extracts strings with quotes', (done) ->
        assert(fs.existsSync('tmp/test8.pot'))

        po.load 'tmp/test8.pot', (catalog) ->
            assert.equal(catalog.items.length, 1)
            assert.equal(catalog.items[0].msgid, 'Hello "world"!')
            assert.equal(catalog.items[0].msgstr, '')
            assert.equal(catalog.items[0].references.length, 1)
            assert.equal(catalog.items[0].references[0], 'test/fixtures/quotes.html')
            done()

    it 'Strips whitespace around strings', (done) ->
        assert(fs.existsSync('tmp/test9.pot'))

        po.load 'tmp/test9.pot', (catalog) ->
            assert.equal(catalog.items.length, 1)
            assert.equal(catalog.items[0].msgid, 'Hello!')
            assert.equal(catalog.items[0].msgstr, '')
            assert.equal(catalog.items[0].references.length, 1)
            assert.equal(catalog.items[0].references[0], 'test/fixtures/strip.html')
            done()

    it 'Handles attribute with < or >', (done) ->
        assert(fs.existsSync('tmp/test10.pot'))

        po.load 'tmp/test10.pot', (catalog) ->
            assert.equal(catalog.items.length, 1)
            assert.equal(catalog.items[0].msgid, 'Show {{trackcount}} song...')
            assert.equal(catalog.items[0].msgid_plural, 'Show all {{trackcount}} songs...')
            assert.equal(catalog.items[0].msgstr.length, 2)
            assert.equal(catalog.items[0].msgstr[0], '')
            assert.equal(catalog.items[0].msgstr[1], '')
            assert.equal(catalog.items[0].references.length, 1)
            assert.equal(catalog.items[0].references[0], 'test/fixtures/ngif.html')
            done()

    it 'Can customize delimiters', (done) ->
        assert(fs.existsSync('tmp/test11.pot'))

        po.load 'tmp/test11.pot', (catalog) ->
            assert.equal(catalog.items.length, 1)
            assert.equal(catalog.items[0].msgid, 'Hello')
            assert.equal(catalog.items[0].msgstr, '')
            assert.equal(catalog.items[0].references.length, 1)
            assert.equal(catalog.items[0].references[0], 'test/fixtures/delim.html')
            done()

    it 'Can extract from PHP files', (done) ->
        assert(fs.existsSync('tmp/test12.pot'))

        po.load 'tmp/test12.pot', (catalog) ->
            assert.equal(catalog.items.length, 1)
            assert.equal(catalog.items[0].msgid, 'Play')
            assert.equal(catalog.items[0].msgstr, '')
            assert.equal(catalog.items[0].references.length, 1)
            assert.equal(catalog.items[0].references[0], 'test/fixtures/php.php')
            done()

