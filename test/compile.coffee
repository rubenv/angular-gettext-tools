assert = require 'assert'
util = require 'util'
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

# Fake Angular environment with RequireJS module loader
makeRequireJsEnv = (mod, modPath, catalog) -> {
    define: (modules, callback) ->
        assert.equal(modules[0], 'angular')
        assert.equal(modules[1], modPath)
        angular = {
            module: (modDefined) ->
                assert.equal(modDefined, mod)
                return {
                    run: (block) ->
                        assert.equal(block[0], 'gettextCatalog')
                        block[1](catalog)
                }
        }
        callback(angular)
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

    it 'Accepts a defaultLanguage parameter', ->
        files = [
            'test/fixtures/nl.po'
        ]
        output = testCompile(files, {
            defaultLanguage: 'nl'
        })

        catalog = {
            called: false
            setStrings: (language, strings) ->
                @called = true
        }

        context = vm.createContext(makeEnv('gettext', catalog))
        vm.runInContext(output, context);
        assert(catalog.called)
        assert.notEqual(output.indexOf("gettextCatalog.currentLanguage = 'nl';"), -1)
        assert.equal(catalog.currentLanguage, 'nl');

    it 'Accepts a requirejs and modulePath parameter', ->
        files = [
            'test/fixtures/nl.po'
        ]
        output = testCompile(files, {
            module: 'myApp'
            requirejs: true
            modulePath: './test/fixtures/module'
        })

        catalog = {
            called: false
            setStrings: (language, strings) ->
                @called = true
        }
        context = vm.createContext(makeRequireJsEnv('myApp', './test/fixtures/module', catalog))
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

    it 'Ignores empty strings', ->
        files = [
            'test/fixtures/empty.po'
        ]
        output = testCompile(files, {
            format: 'json'
        })

        data = JSON.parse(output)
        assert.deepEqual(data.nl, {
            "This is a test": "Dit is een test",
        })

    it 'Ignores fuzzy strings', ->
        files = [
            'test/fixtures/fuzzy.po'
        ]
        output = testCompile(files, {
            format: 'json'
        })

        data = JSON.parse(output)
        assert.deepEqual(data.nl, {
            "This is a test": "Dit is een test",
        })
