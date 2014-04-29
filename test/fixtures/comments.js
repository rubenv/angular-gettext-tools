angular.module("myApp").controller("helloController", function (gettext, gettextCatalog) {
    /// This is a comment
    var myString = gettext("Translate this");

    /// This is two part comment
    /// Second part
    var myString = gettext("Two Part Comment");

	/**
	* Please ignore this comment ///gettext
	  Thank You
	*/
    var myString = gettext("No comment");

    /// Plural Comments
    var myString = gettextCatalog.getPlural(2, "Bird", "Birds");

    /// Comment with no translations, ignore this comment too
});