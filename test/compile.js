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

    it('Leaves html-entities in msgids that are not converted in the browser in tact', function () {
        var files = ['test/fixtures/inconvertible_html_entities.po'];
        var output = testCompile(files, {
            format: 'json'
        });
        var data = JSON.parse(output);
        assert.deepEqual(data.nl, {
            'non-breaking&nbsp;space': 'harde&nbsp;spatie',
            'greater &gt; than': 'groter &gt; dan',
            'less &lt; than': 'kleiner &lt; dan',
            'and &amp;': 'en &lt;'
        });
    });

    it('Converts html-entities in msgids that are also converted in the browser', function () {
        var files = ['test/fixtures/convertible_html_entities.po'];
        var output = testCompile(files, {
            format: 'json'
        });
        var data = JSON.parse(output);
        assert.deepEqual(data.nl, {
            'dots…': 'puntjes&hellip;',
            'cents ¢, pounds £ and euros €': 'centen &cent;, ponden &pound; and euro’s &euro;',
            '«double» and ‹single› guillemets': '&laquo;dubbel&raquo; en &lsaquo;enkele&rsaquo; guillemets',
            'copyright © and registered ® trade ™ marks': 'kopierecht &copy; en geregistreerde &reg; handels &trade; merken',
            '§ sections and paragraphs¶': '&sect; secties en paragrafen&para;',
            'hot 10° cold': 'heet &deg; koud',
            '± greater ≥ or less than ≤': '&plusmn; groter &ge; of kleiner dan &le;',
            'not ≠ or approximately ≈ equal': 'niet &ne; of ongeveer &asymp; gelijk',
            'middle · dot': 'middel &middot; punt',
            'en – and em — dash': 'gedachte&ndash; of aandachts&mdash; streepje',
            '‘single’ ‘quotes‚': '&lsquo;enkele&rsquo; &lsquo;aanhalingstekens&sbquo;',
            '“double” “quotes„': '&ldquo;dubbele&rdquo; &ldquo;aanhalingstekens&bdquo;',
            '† dagger ‡': '&dagger; obelisk &Dagger;',
            '• bullet': '&bull; opsommingsteken',
            '10′23″': '10&prime;23&Prime; tijd',
            'square root ² and to the power of ³': 'kwadraat &sup2; en to de macht &sup3;',
            'fraction two ½ three ⅓ four ¼ and three fourths ¾': 'helft &frac12; derde &frac13; kwart &frac14; en drie-vierde &frac34;'
        });
    });
});
