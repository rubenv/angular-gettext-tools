assert = require 'assert'
fs = require 'fs'
vm = require 'vm'

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

describe 'Compile', ->
    it 'Compiles a .po file into a .js catalog', ->
        assert(fs.existsSync('tmp/test1.js'))

        catalog = {
            setStrings: (language, strings) ->
                assert.equal(language, 'nl')
                assert.equal(strings['Hello!'], 'Hallo!')
                assert.equal(strings['This is a test'], 'Dit is een test')
                assert.deepEqual(strings['Bird'], [ 'Vogel', 'Vogels' ])
        }
        context = vm.createContext(makeEnv('gettext', catalog))
        vm.runInContext(fs.readFileSync('tmp/test1.js', 'utf8'), context)

    it 'Accepts a module parameter', ->
        assert(fs.existsSync('tmp/test2.js'))

        catalog = {
            setStrings: (language, strings) ->
        }
        context = vm.createContext(makeEnv('myApp', catalog))
        vm.runInContext(fs.readFileSync('tmp/test2.js', 'utf8'), context)

    it 'Allows merging multiple languages', ->
        assert(fs.existsSync('tmp/test3.js'))

        languages = 0

        catalog = {
            setStrings: (language, strings) ->
                assert(language == 'nl' || language == 'fr')
                languages++
        }
        context = vm.createContext(makeEnv('gettext', catalog))
        vm.runInContext(fs.readFileSync('tmp/test3.js', 'utf8'), context)
        assert.equal(languages, 2)
