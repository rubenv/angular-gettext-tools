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

describe("Extract (regression tests)", function () {
    it("Issue 23", function () {
        var files = ["test/fixtures/complete/issue23.html"];
        var catalog = testExtract(files);

        var i = 0;

        function assertString(string, line) {
            line = line ? ":" + line : "";

            assert.equal(catalog.items[i].msgid, string);
            assert.equal(catalog.items[i].msgid_plural, null);
            assert.equal(catalog.items[i].references.length, 1);
            assert.equal(catalog.items[i].references[0], "test/fixtures/complete/issue23.html" + line);
            i++;
        }

        assert.equal(catalog.items.length, 17);
        assertString("(Show on map)", 3);
        assertString("Add", 3);
        assertString("Address", 1);
        assertString("All", 3);
        assertString("Birth date", 3);
        assertString("Cancel", 3);
        assertString("Communications", 3);
        assertString("E-mail", 3);
        assertString("Enter your message here...", 3);
        assertString("Log", 3);
        assertString("Order", 3);
        assertString("Orders", 3);
        assertString("Personal details", 1);
        assertString("Preferences", 3);
        assertString("Remarks", 3);
        assertString("Statistics", 3);
        assertString("Subscribed to", 3);
    });
});
