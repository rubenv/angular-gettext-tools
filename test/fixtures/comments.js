angular.module("myApp").controller("helloController", function (gettext, gettextCatalog) {
    /// This is a comment
    var myString = gettext("0: Translate this");

    /// This is two part comment
    /// Second part
    var myString = gettext("1: Two Part Comment");

	/**
	* Please ignore this comment ///gettext
	  Thank You
	*/
    var myString = gettext("2: No comment");

    /// Plural Comments
    var myString = gettextCatalog.getPlural(2, "3: Bird", "Birds");

    /// gettextCatalog.getString() comment
    var myString = gettextCatalog.getString("4: gettextCatalog.getString comment");

    var array = [
        /// gettext inside array
        gettext('5: gettext inside array'),

        /// gettextCatalog inside array
        gettextCatalog.getString('6: gettextCatalog inside array'),

        /// gettextCatalog(gettext) inside array
        gettextCatalog.getString(gettext('7: gettextCatalog(gettext) inside array'))
    ];

    /// Comment with no translations, ignore this comment too
});
