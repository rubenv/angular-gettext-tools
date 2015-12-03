'use strict';

var assert = require('assert');
var util = require('util');
var fs = require('fs');
var vm = require('vm');
var Compiler = require('..').Compiler;

// Fake Angular environment
function makeEnv(mod, catalog) {
    return {
        angular: {
            module: function (modDefined) {
                assert.equal(modDefined, mod);
                return {
                    run: function (block) {
                        assert.equal(block[0], 'gettextCatalog');
                        return block[1](catalog);
                    }
                };
            }
        }
    };
}

// Fake Angular environment with RequireJS module loader
function makeRequireJsEnv(mod, modPath, catalog) {
    return {
        define: function (modules, callback) {
            assert.equal(modules[0], 'angular');
            assert.equal(modules[1], modPath);

            var angular = {
                module: function (modDefined) {
                    assert.equal(modDefined, mod);
                    return {
                        run: function (block) {
                            assert.equal(block[0], 'gettextCatalog');
                            block[1](catalog);
                        }
                    };
                }
            };
            callback(angular);
        }
    };
}

function testCompile(filenames, options) {
    var compiler = new Compiler(options);
    var inputs = filenames.map(function (filename) {
        return fs.readFileSync(filename, 'utf8');
    });
    return compiler.convertPo(inputs);
}

function testCompileCs(filenames, options) {
    var compiler = new Compiler(options);
    var inputs = filenames.map(function (filename) {
        return fs.readFileSync(filename, 'utf8');
    });
    return compiler.convertPo(inputs, 'test.cs');
}

describe('Compile', function () {
    it('Compiles a .po file into a .js catalog', function () {
        var files = ['test/fixtures/nl.po'];
        var output = testCompile(files);
        var catalog = {
            called: false,
            setStrings: function (language, strings) {
                this.called = true;
                assert.equal(language, 'nl');
                assert.equal(strings['Hello!'], 'Hallo!');
                assert.equal(strings['This is a test'], 'Dit is een test');
                assert.deepEqual(strings.Bird, ['Vogel', 'Vogels']);
                assert.deepEqual(strings['Hello "world"'], 'Hallo "wereld"');
            }
        };

        var context = vm.createContext(makeEnv('gettext', catalog));
        vm.runInContext(output, context);
        assert(catalog.called);
    });

    it('Accepts a module parameter', function () {
        var files = ['test/fixtures/nl.po'];
        var output = testCompile(files, {
            module: 'myApp'
        });
        var catalog = {
            called: false,
            setStrings: function (language, strings) {
                this.called = true;
            }
        };

        var context = vm.createContext(makeEnv('myApp', catalog));
        vm.runInContext(output, context);
        assert(catalog.called);
    });

    it('Accepts a defaultLanguage parameter', function () {
        var files = ['test/fixtures/nl.po'];
        var output = testCompile(files, {
            defaultLanguage: 'nl'
        });
        var catalog = {
            called: false,
            setStrings: function (language, strings) {
                this.called = true;
            }
        };

        var context = vm.createContext(makeEnv('gettext', catalog));
        vm.runInContext(output, context);
        assert(catalog.called);
        assert.notEqual(output.indexOf('gettextCatalog.currentLanguage = \'nl\';'), -1);
        assert.equal(catalog.currentLanguage, 'nl');
    });

    it('Accepts a requirejs and modulePath parameter', function () {
        var files = ['test/fixtures/nl.po'];
        var output = testCompile(files, {
            module: 'myApp',
            requirejs: true,
            modulePath: './test/fixtures/module'
        });
        var catalog = {
            called: false,
            setStrings: function (language, strings) {
                this.called = true;
            }
        };

        var context = vm.createContext(makeRequireJsEnv('myApp', './test/fixtures/module', catalog));
        vm.runInContext(output, context);
        assert(catalog.called);
    });

    it('Allows merging multiple languages', function () {
        var files = ['test/fixtures/nl.po', 'test/fixtures/fr.po'];
        var output = testCompile(files);
        var languages = 0;
        var catalog = {
            called: false,
            setStrings: function (language, strings) {
                this.called = true;
                assert(language === 'nl' || language === 'fr');
                languages++;
            }
        };

        var context = vm.createContext(makeEnv('gettext', catalog));
        vm.runInContext(output, context);
        assert.equal(languages, 2);
        assert(catalog.called);
    });

    it('Can output to JSON', function () {
        var files = ['test/fixtures/nl.po', 'test/fixtures/fr.po'];
        var output = testCompile(files, {
            format: 'json'
        });
        var data = JSON.parse(output);

        assert.deepEqual(data.fr, {
            'Hello!': 'Bonjour!',
            'This is a test': 'Ceci est un test',
            'Bird': ['Oiseau', 'Oiseaux']
        });

        assert.deepEqual(data.nl, {
            'Hello!': 'Hallo!',
            'This is a test': 'Dit is een test',
            'Bird': ['Vogel', 'Vogels'],
            'Hello "world"': 'Hallo "wereld"'
        });
    });

    it('Ignores empty strings', function () {
        var files = ['test/fixtures/empty.po'];
        var output = testCompile(files, {
            format: 'json'
        });
        var data = JSON.parse(output);
        assert.deepEqual(data.nl, {
            'This is a test': 'Dit is een test'
        });
    });

    it('Ignores fuzzy strings', function () {
        var files = ['test/fixtures/fuzzy.po'];
        var output = testCompile(files, {
            format: 'json'
        });
        var data = JSON.parse(output);

        assert.deepEqual(data.nl, {
            'This is a test': 'Dit is een test'
        });
    });

    it('Can output multiple inputs to single JSON', function () {
        var files = ['test/fixtures/fr.po', 'test/fixtures/depth/fr.po'];
        var output = testCompile(files, {
            format: 'json'
        });
        var data = JSON.parse(output);

        assert.deepEqual(data.fr, {
            'Hello!': 'Bonjour!',
            'This is a test': 'Ceci est un test',
            'Bird': ['Oiseau', 'Oiseaux'],
            'Goodbye!': 'Au revoir!'
        });
    });

    it('Can handle contexts', function () {
        var files = ['test/fixtures/context.po'];
        var output = testCompile(files, {
            format: 'json'
        });
        var data = JSON.parse(output);

        assert.deepEqual(data.nl, {
            'Hello!': {
                '$$noContext': 'Hallo!',
                'male': 'Hallo (male)!'
            },
            'Goodbye': 'Vaarwel',
            'Ciao': { female: 'Ciao (female)' }
        });
    });

    it('Does not compile obsolete strings', function () {
        var files = ['test/fixtures/obsolete.po'];
        var output = testCompile(files);
        var catalog = {
            called: false,
            setStrings: function (language, strings) {
                this.called = true;
                assert.equal(language, 'nl');
                assert.equal(strings['Hello!'], 'Hallo!');
                assert.equal(strings['Hello "world"'], undefined);
            }
        };

        var context = vm.createContext(makeEnv('gettext', catalog));
        vm.runInContext(output, context);
        assert(catalog.called);
    });

    describe('C# dictionary file', function () {
        it('Generates the expected c# dictionary', function () {
            var files = ['test/fixtures/nl_c#test.po'];
            var output = testCompileCs(files);
            var expectedOutput = 'using System;\n' +
                 'using System.Collections.Generic;\n' +
                 'namespace Core.Common\n' +
                 '{\n' +
                 'public static class Translations{\n' +
                 'public  static readonly Dictionary<string, Dictionary<string, string>> _translations = new Dictionary<string, Dictionary<string, string>>();\n' +
                 'private static Dictionary<string, string> _currentLanguage;\n' +
                 'static Translations()\n' +
                 '{\n' +
                 'var dictionarynl = new Dictionary<string, string>();\n' +
                 'dictionarynl.Add("Hello!","Hallo!");\n' +
                 '_translations.Add("nl", dictionarynl);\n' +
                 '}\n' +
                 'public static void SetCurrentLanguage(string languageCode)\n' +
                 '{\n' +
                 'foreach (var translation in _translations)\n' +
                 '{\n' +
                 'if (translation.Key != languageCode) continue;\n' +
                 '_currentLanguage = translation.Value;\n' +
                 'return;\n' +
                 '}\n' +
                 '}\n' +
                 'public static string Translate(string key)\n' +
                 '{\n' +
                 'try\n' +
                 '{\n' +
                 'return _currentLanguage != null ? _currentLanguage[key] : key;\n' +
                 '}\n' +
                 'catch(Exception)\n' +
                 '{\n' +
                 'return key;\n' +
                 '}\n' +
                 '}\n' +
                 '}\n' +
                 '}\n';

            assert.equal(output, expectedOutput);
        });

        it('Escapes quotes and new lines', function () {
            var files = ['test/fixtures/nl_escape.po'];
            var output = testCompileCs(files);
            var expectedOutput = 'using System;\n' +
                 'using System.Collections.Generic;\n' +
                 'namespace Core.Common\n' +
                 '{\n' +
                 'public static class Translations{\n' +
                 'public  static readonly Dictionary<string, Dictionary<string, string>> _translations = new Dictionary<string, Dictionary<string, string>>();\n' +
                 'private static Dictionary<string, string> _currentLanguage;\n' +
                 'static Translations()\n' +
                 '{\n' +
                 'var dictionarynl = new Dictionary<string, string>();\n' +
                 'dictionarynl.Add("This is a test","Dit is een test");\n' +
                 'dictionarynl.Add("Bird","Vogel");\n' +
                 'dictionarynl.Add("Hello \\"world\\"","Hallo \\"wereld\\"");\n' +
                 '_translations.Add("nl", dictionarynl);\n' +
                 '}\n' +
                 'public static void SetCurrentLanguage(string languageCode)\n' +
                 '{\n' +
                 'foreach (var translation in _translations)\n' +
                 '{\n' +
                 'if (translation.Key != languageCode) continue;\n' +
                 '_currentLanguage = translation.Value;\n' +
                 'return;\n' +
                 '}\n' +
                 '}\n' +
                 'public static string Translate(string key)\n' +
                 '{\n' +
                 'try\n' +
                 '{\n' +
                 'return _currentLanguage != null ? _currentLanguage[key] : key;\n' +
                 '}\n' +
                 'catch(Exception)\n' +
                 '{\n' +
                 'return key;\n' +
                 '}\n' +
                 '}\n' +
                 '}\n' +
                 '}\n';

            assert.equal(output, expectedOutput);
        });

        it('Accepts a defaultLanguage parameter', function () {
            var files = ['test/fixtures/nl_c#test.po'];
            var output = testCompileCs(files, {
                defaultLanguage: 'nl'
            });
            var expectedOutput = 'using System;\n' +
                 'using System.Collections.Generic;\n' +
                 'namespace Core.Common\n' +
                 '{\n' +
                 'public static class Translations{\n' +
                 'public  static readonly Dictionary<string, Dictionary<string, string>> _translations = new Dictionary<string, Dictionary<string, string>>();\n' +
                 'private static Dictionary<string, string> _currentLanguage;\n' +
                 'static Translations()\n' +
                 '{\n' +
                 'var dictionarynl = new Dictionary<string, string>();\n' +
                 'dictionarynl.Add("Hello!","Hallo!");\n' +
                 '_translations.Add("nl", dictionarynl);\n' +
                 'SetCurrentLanguage("nl");\n' +
                 '}\n' +
                 'public static void SetCurrentLanguage(string languageCode)\n' +
                 '{\n' +
                 'foreach (var translation in _translations)\n' +
                 '{\n' +
                 'if (translation.Key != languageCode) continue;\n' +
                 '_currentLanguage = translation.Value;\n' +
                 'return;\n' +
                 '}\n' +
                 '}\n' +
                 'public static string Translate(string key)\n' +
                 '{\n' +
                 'try\n' +
                 '{\n' +
                 'return _currentLanguage != null ? _currentLanguage[key] : key;\n' +
                 '}\n' +
                 'catch(Exception)\n' +
                 '{\n' +
                 'return key;\n' +
                 '}\n' +
                 '}\n' +
                 '}\n' +
                 '}\n';

            assert.equal(output, expectedOutput);
        });

        it('Accepts a namaspace parameter', function () {
            var files = ['test/fixtures/nl_c#test.po'];
            var output = testCompileCs(files, {
                namespace: 'Test.Namaspace'
            });
            var expectedOutput = 'using System;\n' +
                 'using System.Collections.Generic;\n' +
                 'namespace Test.Namaspace\n' +
                 '{\n' +
                 'public static class Translations{\n' +
                 'public  static readonly Dictionary<string, Dictionary<string, string>> _translations = new Dictionary<string, Dictionary<string, string>>();\n' +
                 'private static Dictionary<string, string> _currentLanguage;\n' +
                 'static Translations()\n' +
                 '{\n' +
                 'var dictionarynl = new Dictionary<string, string>();\n' +
                 'dictionarynl.Add("Hello!","Hallo!");\n' +
                 '_translations.Add("nl", dictionarynl);\n' +
                 '}\n' +
                 'public static void SetCurrentLanguage(string languageCode)\n' +
                 '{\n' +
                 'foreach (var translation in _translations)\n' +
                 '{\n' +
                 'if (translation.Key != languageCode) continue;\n' +
                 '_currentLanguage = translation.Value;\n' +
                 'return;\n' +
                 '}\n' +
                 '}\n' +
                 'public static string Translate(string key)\n' +
                 '{\n' +
                 'try\n' +
                 '{\n' +
                 'return _currentLanguage != null ? _currentLanguage[key] : key;\n' +
                 '}\n' +
                 'catch(Exception)\n' +
                 '{\n' +
                 'return key;\n' +
                 '}\n' +
                 '}\n' +
                 '}\n' +
                 '}\n';
            assert.equal(output, expectedOutput);
        });
    });
});
