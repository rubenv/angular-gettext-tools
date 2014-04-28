angular.module("myApp").controller("helloController", function (gettext, gettextCatalog) {
    /// This is a comment
    var myString = gettext("Translate this");

    /// This is two part comment
    /// Second part
    var myString = gettext("Two Part Comment");

    /// Plural Comments
    var myString = gettextCatalog.getPlural(2, "Bird", "Birds");
});