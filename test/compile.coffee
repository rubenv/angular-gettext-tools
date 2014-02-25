assert = require 'assert'
fs = require 'fs'
vm = require 'vm'
Compiler = require('..').Compiler

# Fake Angular environment
makeEnv = (mod, catalog) -> {
    angular:
        module: (modDefined) ->
            assert.equal(modDefined, mod)
            return {
                run: (block) ->
                    assert.equal(block[0], 'gettextCatalog')
                    block[1](catalog)
            }
}

testCompile = (filenames, options) ->
    compiler = new Compiler(options)
    inputs = (fs.readFileSync(filename, 'utf8') for filename in filenames)
    return compiler.convertPo(inputs)

describe 'Compile', ->
    it 'Compiles a .po file into a .js catalog', ->
        files = [
            'test/fixtures/nl.po'
        ]
        output = testCompile(files)

        catalog = {
            called: false
            setStrings: (language, strings) ->
                @called = true
                assert.equal(language, 'nl')
                assert.equal(strings['Hello!'], 'Hallo!')
                assert.equal(strings['This is a test'], 'Dit is een test')
                assert.deepEqual(strings['Bird'], [ 'Vogel', 'Vogels' ])
                assert.deepEqual(strings['Hello \"world\"'], 'Hallo \"wereld\"')
        }
        context = vm.createContext(makeEnv('gettext', catalog))
        vm.runInContext(output, context)
        assert(catalog.called)

    it 'Accepts a module parameter', ->
        files = [
            'test/fixtures/nl.po'
        ]
        output = testCompile(files, {
            module: 'myApp'
        })

        catalog = {
            called: false
            setStrings: (language, strings) ->
                @called = true
        }
        context = vm.createContext(makeEnv('myApp', catalog))
        vm.runInContext(output, context)
        assert(catalog.called)

    it 'Allows merging multiple languages', ->
        files = [
            'test/fixtures/nl.po'
            'test/fixtures/fr.po'
        ]
        output = testCompile(files)

        languages = 0

        catalog = {
            called: false
            setStrings: (language, strings) ->
                @called = true
                assert(language == 'nl' || language == 'fr')
                languages++
        }
        context = vm.createContext(makeEnv('gettext', catalog))
        vm.runInContext(output, context)
        assert.equal(languages, 2)
        assert(catalog.called)

    it 'Can output to JSON', ->
        files = [
            'test/fixtures/nl.po'
            'test/fixtures/fr.po'
        ]
        output = testCompile(files, {
            format: 'json'
        })

        data = JSON.parse(output)
        assert.deepEqual(data.fr, {
            "Hello!": "Bonjour!"
            "This is a test": "Ceci est un test",
            "Bird": ["Oiseau", "Oiseaux"]
        })
        assert.deepEqual(data.nl, {
            "Hello!": "Hallo!"
            "This is a test": "Dit is een test",
            "Bird": ["Vogel", "Vogels"],
            "Hello \"world\"": "Hallo \"wereld\""
        })
