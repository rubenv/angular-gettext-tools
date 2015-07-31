'use strict';

var assert = require('assert');
var mkAttrRegex = require('../lib/extract').mkAttrRegex;

function matchFilter(regex, filter) {
    var matches;
    var result = [];
    while (matches = regex.exec(filter)) {
        var row = {};
        if (matches[2]) {
            row.msgid = matches[2];
        }
        if (matches[4]) {
            row.msgctxt = matches[4];
        }
        result.push(row);
    }
    return result;
}

describe('Extract: Filter regex', function () {
    var regex = null;

    beforeEach(function () {
        regex = mkAttrRegex('{{', '}}');
    });

    it('Matches a simple string', function () {
        var matches = matchFilter(regex, '{{\'Hello\'|translate}}');

        assert.deepEqual(matches, [ { msgid: 'Hello' } ]);
    });

    it('Matches a simple string with multiple filters', function () {
        var matches = matchFilter(regex, '{{\'Hello\'|translate|lowercase}}');

        assert.deepEqual(matches, [ { msgid: 'Hello' } ]);
    });

    it('Matches double quotes', function () {
        var matches = matchFilter(regex, '{{"Hello"|translate}}');

        assert.deepEqual(matches, [ { msgid: 'Hello' } ]);
    });

    it('Matches double quotes with multiple filters', function () {
        var matches = matchFilter(regex, '{{\'Hello\'|translate|lowercase}}');

        assert.deepEqual(matches, [ { msgid: 'Hello' } ]);
    });

    it('Matches multiple strings', function () {
        var matches = matchFilter(regex, '{{\'Hello\'|translate}} {{"Second"|translate}}');

        assert.deepEqual(matches, [
            { msgid: 'Hello' },
            { msgid: 'Second' }
        ]);
    });

    it('Matches multiple strings with multiple filters', function () {
        var matches = matchFilter(regex, '{{\'Hello\'|translate|lowercase}} {{"Second"|translate|uppercase}}');

        assert.deepEqual(matches, [
            { msgid: 'Hello' },
            { msgid: 'Second' }
        ]);
    });

    it('Matches encoded quotes', function () {
        var matches = matchFilter(regex, '{{\'Hello\'|translate}} {{&quot;Second&quot;|translate}}');

        assert.deepEqual(matches, [
            { msgid: 'Hello' },
            { msgid: 'Second' }
        ]);
    });

    it('Matches encoded quotes with multiple filters', function () {
        var matches = matchFilter(regex, '{{\'Hello\'|translate}} {{&quot;Second&quot;|translate|lowercase}}');

        assert.deepEqual(matches, [
            { msgid: 'Hello' },
            { msgid: 'Second' }
        ]);
    });

    it('Matches spaces', function () {
        var matches = matchFilter(regex, '{{ "Hello" | translate }}');

        assert.deepEqual(matches, [ { msgid: 'Hello' } ]);
    });

    it('Matches spaces with multiple filters', function () {
        var matches = matchFilter(regex, '{{ "Hello" | translate | lowercase }}');

        assert.deepEqual(matches, [ { msgid: 'Hello' } ]);
    });

    it('Can customize delimiters', function () {
        var regex = mkAttrRegex('[[', ']]');
        var matches = matchFilter(regex, '[[\'Hello\'|translate]]');

        assert.deepEqual(matches, [ { msgid: 'Hello' } ]);
    });

    it('Can customize delimiters with multiple filters', function () {
        var regex = mkAttrRegex('[[', ']]');
        var matches = matchFilter(regex, '[[\'Hello\'|translate|lowercase]]');

        assert.deepEqual(matches, [ { msgid: 'Hello' } ]);
    });

    it('Can be used without delimiters', function () {
        var regex = mkAttrRegex('', '');
        var matches = matchFilter(regex, '\'Hello\' | translate');

        assert.deepEqual(matches, [ { msgid: 'Hello' } ]);
    });

    it('Can be used without delimiters with multiple filters', function () {
        var regex = mkAttrRegex('', '');
        var matches = matchFilter(regex, '\'Hello\' | translate | lowercase');

        assert.deepEqual(matches, [ { msgid: 'Hello' } ]);
    });

    it('Ignores filters in default delimiters if using empty string as delimiters', function () {
        var regex = mkAttrRegex('', '');
        var matches = matchFilter(regex, '{{\'Hello\' | translate}}');

        assert.deepEqual(matches, []);
    });

    it('Matches string with context', function () {
        var matches = matchFilter(regex, '{{\'Hello\'|translate:\'someContext\'}}');

        assert.deepEqual(matches, [ { msgid: 'Hello', msgctxt: 'someContext' } ]);
    });

    it('Matches string with context and spaces', function () {
        var matches = matchFilter(regex, '{{ \'Hello\' | translate : \'someContext\' }}');

        assert.deepEqual(matches, [ { msgid: 'Hello', msgctxt: 'someContext' } ]);
    });
});
