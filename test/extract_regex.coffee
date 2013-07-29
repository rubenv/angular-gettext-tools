assert = require 'assert'
regex = require('../tasks/extract').regex

describe 'Extract: Filter regex', ->
    it 'Matches a simple string', ->
        while matches = regex.exec("{{'Hello'|translate}}")
            assert.equal(matches.length, 3)
            assert.equal(matches[2], 'Hello')

    it 'Matches double quotes', ->
        while matches = regex.exec('{{"Hello"|translate}}')
            assert.equal(matches.length, 3)
            assert.equal(matches[2], 'Hello')

    it 'Matches multiple strings', ->
        hit = 0
        while matches = regex.exec("{{'Hello'|translate}} {{\"Second\"|translate}}")
            if hit == 0
                assert.equal(matches.length, 3)
                assert.equal(matches[2], 'Hello')
                hit++
            else if hit == 1
                assert.equal(matches.length, 3)
                assert.equal(matches[2], 'Second')
