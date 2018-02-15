'use strict';

var assert = require('assert');
var testExtract = require('./utils').testExtract;

describe('Extracting comments', function () {
    it('works on HTML', function () {
        var files = [
            'test/fixtures/comments.html'
        ];
        var catalog = testExtract(files);

        var i = catalog.items;
        assert.equal(i.length, 1);

        assert.equal(i[0].msgid, 'Translate this');
        assert.deepEqual(i[0].extractedComments, ['This is a comment']);
    });

    it('works on Javascript', function () {
        var files = [
            'test/fixtures/comments.js'
        ];
        var catalog = testExtract(files);

        var i = catalog.items;

        assert.equal(i.length, 8);

        assert.equal(i[0].msgid, '0: Translate this');
        assert.deepEqual(i[0].extractedComments, ['This is a comment']);

        assert.equal(i[1].msgid, '1: Two Part Comment');
        assert.deepEqual(i[1].extractedComments, ['This is two part comment, Second part']);

        assert.equal(i[2].msgid, '2: No comment');
        assert.deepEqual(i[2].extractedComments, []);

        assert.equal(i[3].msgid, '3: Bird');
        assert.deepEqual(i[3].extractedComments, ['Plural Comments']);

        assert.equal(i[4].msgid, '4: gettextCatalog.getString comment');
        assert.deepEqual(i[4].extractedComments, ['gettextCatalog.getString() comment']);

        assert.equal(i[5].msgid, '5: gettext inside array');
        assert.deepEqual(i[5].extractedComments, ['gettext inside array']);

        assert.equal(i[6].msgid, '6: gettextCatalog inside array');
        assert.deepEqual(i[6].extractedComments, ['gettextCatalog inside array']);

        assert.equal(i[7].msgid, '7: gettextCatalog(gettext) inside array');
        assert.deepEqual(i[7].extractedComments, ['gettextCatalog(gettext) inside array']);
    });

    it('works on Typescript', function () {
        var files = [
            'test/fixtures/comments.ts'
        ];
        var catalog = testExtract(files);

        var i = catalog.items;

        assert.equal(i.length, 8);

        assert.equal(i[0].msgid, '0: Translate this');
        assert.deepEqual(i[0].extractedComments, ['This is a comment']);

        assert.equal(i[1].msgid, '1: Two Part Comment');
        assert.deepEqual(i[1].extractedComments, ['This is two part comment, Second part']);

        assert.equal(i[2].msgid, '2: No comment');
        assert.deepEqual(i[2].extractedComments, []);

        assert.equal(i[3].msgid, '3: Bird');
        assert.deepEqual(i[3].extractedComments, ['Plural Comments']);

        assert.equal(i[4].msgid, '4: gettextCatalog.getString comment');
        assert.deepEqual(i[4].extractedComments, ['gettextCatalog.getString() comment']);

        assert.equal(i[5].msgid, '5: gettext inside array');
        assert.deepEqual(i[5].extractedComments, ['gettext inside array']);

        assert.equal(i[6].msgid, '6: gettextCatalog inside array');
        assert.deepEqual(i[6].extractedComments, ['gettextCatalog inside array']);

        assert.equal(i[7].msgid, '7: gettextCatalog(gettext) inside array');
        assert.deepEqual(i[7].extractedComments, ['gettextCatalog(gettext) inside array']);
    });

    it('merges duplicate comments', function () {
        var files = [
            'test/fixtures/duplicate-comments.html'
        ];
        var catalog = testExtract(files);

        var i = catalog.items;
        assert.equal(i.length, 1);

        assert.equal(i[0].msgid, 'Translate this');
        assert.deepEqual(i[0].extractedComments, ['This is a comment']);
    });

    it('Should order multi-line JS comments', function () {
        var files = [
            'test/fixtures/multi-line-comments.js'
        ];
        var catalog = testExtract(files);

        var i = catalog.items;
        assert.equal(i.length, 2);

        assert.equal(i[0].msgid, '0');
        assert.equal(i[0].extractedComments.length, 2);
        assert.equal(i[0].extractedComments[0], 'A, B');
        assert.equal(i[0].extractedComments[1], 'B, A');

        assert.equal(i[1].msgid, '1');
        assert.equal(i[1].extractedComments.length, 1);
        assert.equal(i[1].extractedComments[0], 'B, A');
    });

    it('extracts custom attribute comments from HTML', function () {
        var files = [
            'test/fixtures/comments.html'
        ];
        var catalog = testExtract(files, {
            attributes: ['custom-attr']
        });

        var i = catalog.items;
        assert.equal(i.length, 2);

        assert.equal(i[0].msgid, 'And this');
        assert.deepEqual(i[0].extractedComments, ['This is a custom attribute comment']);

        assert.equal(i[1].msgid, 'Translate this');
        assert.deepEqual(i[1].extractedComments, ['This is a comment']);
    });
});
