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

function generateTest( name, txt, expected, regex ) {
    it(name, function () {
        var matches = matchFilter(regex || mkAttrRegex('{{', '}}'), txt);

        assert.deepEqual(matches, expected);
    });
}

describe('Extract: Filter regex', function () {
    var regex = null;

    beforeEach(function () {
        regex = mkAttrRegex('{{', '}}');
    });

    generateTest('Matches a simple string', '{{\'Hello\'|translate}}', [ { msgid: 'Hello' } ]);

    generateTest('Matches a simple string with multiple filters', '{{\'Hello\'|translate|lowercase}}', [ { msgid: 'Hello' } ]);

    generateTest('Matches double quotes', '{{"Hello"|translate}}', [ { msgid: 'Hello' } ]);

    generateTest('Matches double quotes with multiple filters', '{{\'Hello\'|translate|lowercase}}', [ { msgid: 'Hello' } ]);

    generateTest('Matches multiple strings', '{{\'Hello\'|translate}} {{"Second"|translate}}', [
        { msgid: 'Hello' },
        { msgid: 'Second' }
    ]);

    generateTest('Matches multiple strings with multiple filters', '{{\'Hello\'|translate|lowercase}} {{"Second"|translate|uppercase}}', [
            { msgid: 'Hello' },
            { msgid: 'Second' }
        ]);

    generateTest('Matches encoded quotes', '{{\'Hello\'|translate}} {{&quot;Second&quot;|translate}}', [
            { msgid: 'Hello' },
            { msgid: 'Second' }
        ]);

    generateTest('Matches encoded quotes with multiple filters', '{{\'Hello\'|translate}} {{&quot;Second&quot;|translate|lowercase}}', [
            { msgid: 'Hello' },
            { msgid: 'Second' }
        ]);

    generateTest('Matches spaces', '{{ "Hello" | translate }}', [ { msgid: 'Hello' } ]);

    generateTest('Matches spaces with multiple filters', '{{ "Hello" | translate | lowercase }}', [ { msgid: 'Hello' } ]);

    generateTest('Can customize delimiters', '[[\'Hello\'|translate]]', [ { msgid: 'Hello' } ], mkAttrRegex('[[', ']]'));

    generateTest('Can customize delimiters with multiple filters', '[[\'Hello\'|translate|lowercase]]', [ { msgid: 'Hello' } ], mkAttrRegex('[[', ']]'));

    generateTest('Can be used without delimiters', '\'Hello\' | translate', [ { msgid: 'Hello' } ], mkAttrRegex('', ''));

    generateTest('Can be used without delimiters with multiple filters', '\'Hello\' | translate | lowercase', [ { msgid: 'Hello' } ], mkAttrRegex('', ''));

    generateTest('Ignores filters in default delimiters if using empty string as delimiters', '{{\'Hello\' | translate}}', [], mkAttrRegex('', ''));

    generateTest('Matches string with context', '{{\'Hello\'|translate:\'someContext\'}}', [ { msgid: 'Hello', msgctxt: 'someContext' } ]);

    generateTest('Matches string with context and spaces', '{{ \'Hello\' | translate : \'someContext\' }}', [ { msgid: 'Hello', msgctxt: 'someContext' } ]);
});
