# angular-gettext-tools

> Tools for extracting/compiling angular-gettext strings.

Used to construct build tools for [`angular-gettext`](https://github.com/rubenv/angular-gettext).

[![Build Status](https://travis-ci.org/rubenv/grunt-angular-gettext.png?branch=master)](https://travis-ci.org/rubenv/angular-gettext-tools)

## Usage

You probably want to use one of the build plugins that wrap this library
instead. Current implementations:

* [Grunt plugin](https://github.com/rubenv/grunt-angular-gettext)
* [Gulp plugin](https://github.com/gabegorelick/gulp-angular-gettext)

## API

`angular-gettext-tools` has two components: an `Extractor` for extracting
translatable strings into a [POT file](http://www.icanlocalize.com/site/tutorials/how-to-translate-with-gettext-po-and-pot-files),
and a `Compiler` for converting [PO files](https://www.gnu.org/software/gettext/manual/html_node/PO-Files.html)
into a format that the runtime library ([angular-gettext](https://github.com/rubenv/angular-gettext))
can consume.

For more information, check out the [official website](https://angular-gettext.rocketeer.be).

### `Extractor` options

All `Extractor` options are optional.

#### `startDelim`
Delimiter that starts your Angular expressions. If you're using
[custom delimiters](https://docs.angularjs.org/api/ng/provider/$interpolateProvider)
for your Angular expressions, you should set the the `Extractor` can parse your
expressions. Defaults to `{{`, which is Angular's default.

#### `endDelim`
Delimiter that ends your Angular expressions. Defaults to `}}`, which is
Angular's default.

#### `markerName`
String to use as marker when parsing JavaScript for extractable strings.
Defaults to `gettext`.

#### `markerNames`
Array of additional markers. If you're using a custom service that wraps
`angular-gettext`, you'll probably want to pass the name of your service here
so `angular-gettext-tools` can extract your strings.

#### `lineNumbers`
`false` to disable outputting line numbers in PO file references. Defaults to
`true`.

#### `extensions`
Object mapping file extensions to extraction strategies. Valid
strategies are `html` or `js`. For example, if you have a file `foo.bar` you
want parsed as HTML, pass `{extensions: {foo: 'html'}}` to the `Extractor`.

#### `postProcess`
Callback to post process the resulting PO file. Passed a
[`pofile`](https://www.npmjs.com/package/pofile) object.

### `Compiler` options

All `Compiler` options are optional.

#### `format`
Output format. `javascript` or `json`. Defaults to `javascript` for ease of use,
but for more control over how strings are loaded into your app, consider using
`json` and then generating your own JavaScript to suit your needs.

#### `module`
Name of the Angular module to output. Only used if `format` is `javascript`.
Defaults to `gettext`.

#### `requirejs`
Whether to wrap the output in a [RequireJS](http://requirejs.org) module. Only
used if `format` is `javascript`. Defaults to false.

## License 

    (The MIT License)

    Copyright (C) 2013-2015 by Ruben Vermeersch <ruben@rocketeer.be>

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
