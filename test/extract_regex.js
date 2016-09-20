'use strict';

var assert = require('assert');
var mkAttrRegex = require('../lib/extract').mkAttrRegex;

describe('Extract: Filter regex', function () {
    var regex = null;

    beforeEach(function () {
        regex = mkAttrRegex('{{', '}}');
    });

    it('Matches a simple string', function () {
        var matches;
        var hit = false;

        while (matches = regex.exec('{{\'Hello\'|translate}}')) {
            assert.equal(matches.length, 5);
            assert.equal(matches[2], 'Hello');
            hit = true;
        }
        assert(hit);
    });

    it('Matches a simple string with multiple filters', function () {
        var matches;
        var hit = false;

        while (matches = regex.exec('{{\'Hello\'|translate|lowercase}}')) {
            assert.equal(matches.length, 5);
            assert.equal(matches[2], 'Hello');
            hit = true;
        }
        assert(hit);
    });

    it('Matches double quotes', function () {
        var matches;
        var hit = false;

        while (matches = regex.exec('{{"Hello"|translate}}')) {
            assert.equal(matches.length, 5);
            assert.equal(matches[2], 'Hello');
            hit = true;
        }
        assert(hit);
    });

    it('Matches double quotes with multiple filters', function () {
        var matches;
        var hit = false;

        while (matches = regex.exec('{{\'Hello\'|translate|lowercase}}')) {
            assert.equal(matches.length, 5);
            assert.equal(matches[2], 'Hello');
            hit = true;
        }
        assert(hit);
    });

    it('Matches multiple strings', function () {
        var matches;
        var hit = 0;

        while (matches = regex.exec('{{\'Hello\'|translate}} {{"Second"|translate}}')) {
            if (hit === 0) {
                assert.equal(matches.length, 5);
                assert.equal(matches[2], 'Hello');
            } else if (hit === 1) {
                assert.equal(matches.length, 5);
                assert.equal(matches[2], 'Second');
            }
            hit++;
        }
        assert.equal(hit, 2);
    });

    it('Matches multiple strings with multiple filters', function () {
        var matches;
        var hit = 0;

        while (matches = regex.exec('{{\'Hello\'|translate|lowercase}} {{"Second"|translate|uppercase}}')) {
            if (hit === 0) {
                assert.equal(matches.length, 5);
                assert.equal(matches[2], 'Hello');
            } else if (hit === 1) {
                assert.equal(matches.length, 5);
                assert.equal(matches[2], 'Second');
            }
            hit++;
        }
        assert.equal(hit, 2);
    });

    it('Matches encoded quotes', function () {
        var matches;
        var hit = 0;

        while (matches = regex.exec('{{\'Hello\'|translate}} {{&quot;Second&quot;|translate}}')) {
            if (hit === 0) {
                assert.equal(matches.length, 5);
                assert.equal(matches[2], 'Hello');
            } else if (hit === 1) {
                assert.equal(matches.length, 5);
                assert.equal(matches[2], 'Second');
            }
            hit++;
        }
        assert.equal(hit, 2);
    });

    it('Matches encoded quotes with multiple filters', function () {
        var matches;
        var hit = 0;

        while (matches = regex.exec('{{\'Hello\'|translate}} {{&quot;Second&quot;|translate|lowercase}}')) {
            if (hit === 0) {
                assert.equal(matches.length, 5);
                assert.equal(matches[2], 'Hello');
            } else if (hit === 1) {
                assert.equal(matches.length, 5);
                assert.equal(matches[2], 'Second');
            }
            hit++;
        }
        assert.equal(hit, 2);
    });

    it('Matches spaces', function () {
        var matches;
        var hit = false;

        while (matches = regex.exec('{{ "Hello" | translate }}')) {
            assert.equal(matches.length, 5);
            assert.equal(matches[2], 'Hello');
            hit = true;
        }
        assert(hit);
    });

    it('Matches spaces with multiple filters', function () {
        var matches;
        var hit = false;

        while (matches = regex.exec('{{ "Hello" | translate | lowercase }}')) {
            assert.equal(matches.length, 5);
            assert.equal(matches[2], 'Hello');
            hit = true;
        }
        assert(hit);
    });

    it('Can customize delimiters', function () {
        var matches;
        var regex = mkAttrRegex('[[', ']]');
        var hit = false;

        while (matches = regex.exec('[[\'Hello\'|translate]]')) {
            assert.equal(matches.length, 5);
            assert.equal(matches[2], 'Hello');
            hit = true;
        }
        assert(hit);
    });

    it('Can customize delimiters with multiple filters', function () {
        var matches;
        var regex = mkAttrRegex('[[', ']]');
        var hit = false;

        while (matches = regex.exec('[[\'Hello\'|translate|lowercase]]')) {
            assert.equal(matches.length, 5);
            assert.equal(matches[2], 'Hello');
            hit = true;
        }
        assert(hit);
    });

    it('Can be used without delimiters', function () {
        var matches;
        var regex = mkAttrRegex('', '');
        var hit = false;

        while (matches = regex.exec('\'Hello\' | translate')) {
            assert.equal(matches.length, 5);
            assert.equal(matches[2], 'Hello');
            hit = true;
        }
        assert(hit);
    });

    it('Can be used without delimiters with multiple filters', function () {
        var matches;
        var regex = mkAttrRegex('', '');
        var hit = false;

        while (matches = regex.exec('\'Hello\' | translate | lowercase')) {
            assert.equal(matches.length, 5);
            assert.equal(matches[2], 'Hello');
            hit = true;
        }
        assert(hit);
        matches = regex.exec('{{\'Hello\' | translate}}');
        assert.equal(matches, null);
    });

    it('Can be used with filter context', function () {
        var matches;
        var regex = mkAttrRegex('', '');
        var hit = false;

        while (matches = regex.exec('\'Hello\' | translate:"context"')) {
            assert.equal(matches.length, 5);
            assert.equal(matches[2], 'Hello');
            assert.equal(matches[4], 'context');
            hit = true;
        }

        assert(hit);
    });
});
