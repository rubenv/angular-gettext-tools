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

        function assertString(string, plural) {
            if (plural == null) {
                plural = null;
            }
            assert.equal(catalog.items[i].msgid, string);
            assert.equal(catalog.items[i].msgid_plural, plural);
            assert.equal(catalog.items[i].references.length, 1);
            assert.equal(catalog.items[i].references[0], "test/fixtures/complete/issue23.html");
            i++;
        }

        assert.equal(catalog.items.length, 17);
        assertString("(Show on map)");
        assertString("Add");
        assertString("Address");
        assertString("All");
        assertString("Birth date");
        assertString("Cancel");
        assertString("Communications");
        assertString("E-mail");
        assertString("Enter your message here...");
        assertString("Log");
        assertString("Order");
        assertString("Orders");
        assertString("Personal details");
        assertString("Preferences");
        assertString("Remarks");
        assertString("Statistics");
        assertString("Subscribed to");
    });
});
