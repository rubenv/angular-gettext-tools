'use strict';

var assert = require('assert');
var testExtract = require('./utils').testExtract;

describe('Extracting files with different extensions', function () {
    it('supports custom HTML file extensions', function () {
        var files = [
            'test/fixtures/custom.extension'
        ];
        var catalog = testExtract(files, {
            extensions: {
                extension: 'html'
            }
        });

        assert.equal(catalog.items.length, 2);
        assert.equal(catalog.items[0].msgid, 'Custom file!');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/custom.extension:3']);
    });

    it('supports custom JS file extensions', function () {
        var files = [
            'test/fixtures/custom.js_extension'
        ];
        var catalog = testExtract(files, {
            extensions: {
                js_extension: 'js'
            }
        });

        assert.equal(catalog.items.length, 1);
        assert.equal(catalog.items[0].msgid, 'Hello custom');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/custom.js_extension:2']);
    });

    it('supports PHP files', function () {
        var files = [
            'test/fixtures/php.php'
        ];
        var catalog =  testExtract(files);

        assert.equal(catalog.items.length, 1);
        assert.equal(catalog.items[0].msgid, 'Play');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/php.php:2']);
    });

    it('supports EJS files', function () {
        var files = [
            'test/fixtures/ejs.ejs'
        ];
        var catalog =  testExtract(files);

        assert.equal(catalog.items.length, 1);
        assert.equal(catalog.items[0].msgid, 'EJS Link');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/ejs.ejs:2']);
    });

    it('supports ERB files', function () {
        var files = [
            'test/fixtures/erb.erb'
        ];
        var catalog =  testExtract(files);

        assert.equal(catalog.items.length, 1);
        assert.equal(catalog.items[0].msgid, 'message');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/erb.erb:3']);
    });

    it('supports JSP .jsp files', function () {
        var files = [
            'test/fixtures/jsp.jsp'
        ];
        var catalog =  testExtract(files);

        assert.equal(catalog.items.length, 1);
        assert.equal(catalog.items[0].msgid, 'message');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/jsp.jsp:3']);
    });
    it('supports JSP .tag files', function () {
        var files = [
            'test/fixtures/tag.tag'
        ];
        var catalog =  testExtract(files);

        assert.equal(catalog.items.length, 1);
        assert.equal(catalog.items[0].msgid, 'message');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/tag.tag:3']);
    });


    it('supports tapestry files', function () {
        var files = [
            'test/fixtures/tapestry.tml'
        ];
        var catalog =  testExtract(files);

        assert.equal(catalog.items.length, 1);
        assert.equal(catalog.items[0].msgid, 'Bonjour from HelloWorld component.');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/tapestry.tml:2']);
    });

    it('supports TypeScript files', function () {
        var files = [
            'test/fixtures/ts.ts'
        ];
        var catalog =  testExtract(files);

        assert.equal(catalog.items.length, 2);
        assert.equal(catalog.items[0].msgid, 'Hello');
        assert.equal(catalog.items[0].msgstr, '');
        assert.deepEqual(catalog.items[0].references, ['test/fixtures/ts.ts:2']);

        assert.equal(catalog.items[1].msgid, 'One\nTwo\nThree');
        assert.equal(catalog.items[1].msgstr, '');
        assert.deepEqual(catalog.items[1].references, ['test/fixtures/ts.ts:3']);
    });
});
