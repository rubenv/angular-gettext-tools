
assert = require('assert')
testExtract = require('./utils').testExtract

describe 'Extracting comments', ->

    it 'works on HTML', ->
        files = [
            'test/fixtures/comments.html'
        ]
        catalog = testExtract(files)

        i = catalog.items
        assert.equal(i.length, 1)

        assert.equal(i[0].msgid, 'Translate this')
        assert.equal(i[0].extractedComments, 'This is a comment')

    it 'works on Javascript', ->
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

    it 'merges duplicate comments', ->
        files = [
            'test/fixtures/duplicate-comments.html'
        ]
        catalog = testExtract(files)

        i = catalog.items
        assert.equal(i.length, 1)

        assert.equal(i[0].msgid, 'Translate this')
        assert.equal(i[0].extractedComments.length, 1)
        assert.equal(i[0].extractedComments, 'This is a comment')
