"use strict";

var assert = require("assert");
var PO = require("pofile");
var fs = require("fs");
var Extractor = require("..").Extractor;

function testExtract(filenames, options) {
    var extractor = new Extractor(options);
    filenames.forEach(function (filename) {
        extractor.parse(filename, fs.readFileSync(filename, "utf8"));
    });
    return PO.parse(extractor.toString());
}

describe("Extract (multi-line HTML)", function () {
    it("Issue 122", function () {
        var files = ["test/fixtures/widget.html"];
        var catalog = testExtract(files);

        var i = 0;

        function assertString(string, line, plural) {
            line = line ? ":" + line : "";

            assert.equal(catalog.items[i].msgid, string);
            assert.equal(catalog.items[i].msgid_plural, plural);
            assert.equal(catalog.items[i].references.length, 1);
            assert.equal(catalog.items[i].references[0], "test/fixtures/widget.html" + line);
            i++;
        }

        assert.equal(catalog.items.length, 2);
        assertString("Available for {{$count}} {{datatype}} ({{($count / total * 100) | number:2}}%)", 1, "Available for {{$count}} {{datatypePlural}} ({{($count / total * 100) | number:2}}%)");
        assertString("No data", 1);
    });
});
