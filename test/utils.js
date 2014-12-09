'use strict';

var PO = require('pofile');
var fs = require('fs');
var Extractor = require('..').Extractor;

function testExtract(filenames, options) {
    var extractor = new Extractor(options);
    filenames.forEach(function (filename) {
        extractor.parse(filename, fs.readFileSync(filename, 'utf8'));
    });

    return PO.parse(extractor.toString());
}

module.exports = {
    testExtract: testExtract
};
