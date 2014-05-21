assert = require 'assert'
mkAttrRegex = require('../lib/extract').mkAttrRegex

describe 'Extract: Filter regex', ->
    regex = null

    beforeEach () ->
        regex = mkAttrRegex('{{', '}}')

    it 'Matches a simple string', ->
        hit = false
        while matches = regex.exec("{{'Hello'|translate}}")
            assert.equal(matches.length, 4)
            assert.equal(matches[2], 'Hello')
            hit = true
        assert(hit)

    it 'Matches a simple string with multiple filters', ->
        hit = false
        while matches = regex.exec("{{'Hello'|translate|lowercase}}")
            assert.equal(matches.length, 4)
            assert.equal(matches[2], 'Hello')
            hit = true
        assert(hit)

    it 'Matches double quotes', ->
        hit = false
        while matches = regex.exec('{{"Hello"|translate}}')
            assert.equal(matches.length, 4)
            assert.equal(matches[2], 'Hello')
            hit = true
        assert(hit)

    it 'Matches double quotes with multiple filters', ->
        hit = false
        while matches = regex.exec('{{"Hello"|translate|lowercase}}')
            assert.equal(matches.length, 4)
            assert.equal(matches[2], 'Hello')
            hit = true
        assert(hit)

    it 'Matches multiple strings', ->
        hit = 0
        while matches = regex.exec("{{'Hello'|translate}} {{\"Second\"|translate}}")
            if hit == 0
                assert.equal(matches.length, 4)
                assert.equal(matches[2], 'Hello')
            else if hit == 1
                assert.equal(matches.length, 4)
                assert.equal(matches[2], 'Second')
            hit++

        assert.equal(hit, 2)

    it 'Matches multiple strings with multiple filters', ->
        hit = 0
        while matches = regex.exec("{{'Hello'|translate|lowercase}} {{\"Second\"|translate|uppercase}}")
            if hit == 0
                assert.equal(matches.length, 4)
                assert.equal(matches[2], 'Hello')
            else if hit == 1
                assert.equal(matches.length, 4)
                assert.equal(matches[2], 'Second')
            hit++

        assert.equal(hit, 2)

    it 'Matches filters in complex objects', ->
        hit = false
        while matches = regex.exec("{{ {first: ('Hello'|translate)} }}")
            assert.equal(matches.length, 4)
            assert.equal(matches[2], 'Hello')
            hit = true

        assert(hit)

    it 'Matches filters in JSON', ->
        hit = false
        while matches = regex.exec("{{ {\"first\": ('Hello'|translate)} }}")
            assert.equal(matches.length, 4)
            assert.equal(matches[2], 'Hello')
            hit = true

        assert(hit)

    it 'Does not match JSON with same quotes as property name', ->
        hit = false
        # Unable to match with regexp {'first': ('Hello'|translate)}
        while matches = regex.exec("{{ {'first': ('Hello'|translate)} }}")
            assert.equal(matches.length, 4)
            assert.equal(matches[2], 'first\': (\'Hello')
            hit = true

        assert(hit)


    it 'Matches filters in expressions', ->
        hit = 0
        while matches = regex.exec("{{ a==b ? 'Hello'|translate : 'empty' }}")
            if hit == 0
                assert.equal(matches.length, 4)
                assert.equal(matches[2], 'Hello')
            hit++

        assert.equal(hit, 1)

    it 'Matches multiple filters in expressions', ->
        hit = 0
        while matches = regex.exec("{{ a==b ? 'Hello'|translate : 'Second'|translate }}")
            if hit == 0
                assert.equal(matches.length, 4)
                assert.equal(matches[2], 'Hello')
            else if hit == 1
                assert.equal(matches.length, 4)
                assert.equal(matches[2], 'Second')
            hit++

        assert.equal(hit, 1)

    it 'Matches encoded quotes', ->
        hit = 0
        while matches = regex.exec("{{'Hello'|translate}} {{&quot;Second&quot;|translate}}")
            if hit == 0
                assert.equal(matches.length, 4)
                assert.equal(matches[2], 'Hello')
            else if hit == 1
                assert.equal(matches.length, 4)
                assert.equal(matches[2], 'Second')
            hit++

        assert.equal(hit, 2)

    it 'Matches encoded quotes with multiple filters', ->
        hit = 0
        while matches = regex.exec("{{'Hello'|translate}} {{&quot;Second&quot;|translate|lowercase}}")
            if hit == 0
                assert.equal(matches.length, 4)
                assert.equal(matches[2], 'Hello')
            else if hit == 1
                assert.equal(matches.length, 4)
                assert.equal(matches[2], 'Second')
            hit++

        assert.equal(hit, 2)

    it 'Matches spaces', ->
        hit = false
        while matches = regex.exec('{{ "Hello" | translate }}')
            assert.equal(matches.length, 4)
            assert.equal(matches[2], 'Hello')
            hit = true
        assert(hit)

    it 'Matches spaces with multiple filters', ->
        hit = false
        while matches = regex.exec('{{ "Hello" | translate | lowercase }}')
            assert.equal(matches.length, 4)
            assert.equal(matches[2], 'Hello')
            hit = true
        assert(hit)

    it 'Can customize delimiters', ->
        regex = mkAttrRegex('[[', ']]')
        hit = false
        while matches = regex.exec("[['Hello'|translate]]")
            assert.equal(matches.length, 4)
            assert.equal(matches[2], 'Hello')
            hit = true
        assert(hit)

    it 'Can customize delimiters with multiple filters', ->
        regex = mkAttrRegex('[[', ']]')
        hit = false
        while matches = regex.exec("[['Hello'|translate|lowercase]]")
            assert.equal(matches.length, 4)
            assert.equal(matches[2], 'Hello')
            hit = true
        assert(hit)

    it 'Can be used without delimiters', ->
        regex = mkAttrRegex('', '')
        hit = false
        while matches = regex.exec("'Hello' | translate")
            assert.equal(matches.length, 4)
            assert.equal(matches[2], 'Hello')
            hit = true
        assert(hit)

    it 'Can be used without delimiters with multiple filters', ->
        regex = mkAttrRegex('', '')
        hit = false
        while matches = regex.exec("'Hello' | translate | lowercase")
            assert.equal(matches.length, 4)
            assert.equal(matches[2], 'Hello')
            hit = true
        assert(hit)

        matches = regex.exec("{{'Hello' | translate}}")
        assert.equal(matches, null)
