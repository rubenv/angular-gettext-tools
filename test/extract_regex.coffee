assert = require 'assert'
mkAttrRegex = require('../tasks/extract').mkAttrRegex

describe 'Extract: Filter regex', ->
    regex = null

    beforeEach () ->
        regex = mkAttrRegex('{{', '}}')

    it 'Matches a simple string', ->
        hit = false
        while matches = regex.exec("{{'Hello'|translate}}")
            assert.equal(matches.length, 3)
            assert.equal(matches[2], 'Hello')
            hit = true
        assert(hit)

    it 'Matches double quotes', ->
        hit = false
        while matches = regex.exec('{{"Hello"|translate}}')
            assert.equal(matches.length, 3)
            assert.equal(matches[2], 'Hello')
            hit = true
        assert(hit)

    it 'Matches multiple strings', ->
        hit = 0
        while matches = regex.exec("{{'Hello'|translate}} {{\"Second\"|translate}}")
            if hit == 0
                assert.equal(matches.length, 3)
                assert.equal(matches[2], 'Hello')
            else if hit == 1
                assert.equal(matches.length, 3)
                assert.equal(matches[2], 'Second')
            hit++

        assert.equal(hit, 2)

    it 'Matches encoded quotes', ->
        hit = 0
        while matches = regex.exec("{{'Hello'|translate}} {{&quot;Second&quot;|translate}}")
            if hit == 0
                assert.equal(matches.length, 3)
                assert.equal(matches[2], 'Hello')
            else if hit == 1
                assert.equal(matches.length, 3)
                assert.equal(matches[2], 'Second')
            hit++

        assert.equal(hit, 2)

    it 'Matches spaces', ->
        hit = false
        while matches = regex.exec('{{ "Hello" | translate }}')
            assert.equal(matches.length, 3)
            assert.equal(matches[2], 'Hello')
            hit = true
        assert(hit)

    it 'Can customize delimiters', ->
        regex = mkAttrRegex('[[', ']]')
        hit = false
        while matches = regex.exec("[['Hello'|translate]]")
            assert.equal(matches.length, 3)
            assert.equal(matches[2], 'Hello')
            hit = true
        assert(hit)

    it 'Can be used without delimiters', ->
        regex = mkAttrRegex('', '')
        hit = false
        while matches = regex.exec("'Hello' | translate")
            assert.equal(matches.length, 3)
            assert.equal(matches[2], 'Hello')
            hit = true
        assert(hit)

        matches = regex.exec("{{'Hello' | translate}}")
        assert.equal(matches, null)
