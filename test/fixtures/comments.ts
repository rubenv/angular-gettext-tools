angular.module("myApp").controller("helloController", (gettext, gettextCatalog) => {
    /// This is a comment
    let myString0 = gettext("0: Translate this");

    /// This is two part comment
    /// Second part
    let myString1 = gettext("1: Two Part Comment");

    /**
     * Please ignore this comment ///gettext
     Thank You
     */
    let myString2 = gettext("2: No comment");

    /// Plural Comments
    let myString3 = gettextCatalog.getPlural(2, "3: Bird", "Birds");

    /// gettextCatalog.getString() comment
    let myString4 = gettextCatalog.getString("4: gettextCatalog.getString comment");

    let array = [
        /// gettext inside array
        gettext('5: gettext inside array'),

        /// gettextCatalog inside array
        gettextCatalog.getString('6: gettextCatalog inside array'),

        /// gettextCatalog(gettext) inside array
        gettextCatalog.getString(gettext('7: gettextCatalog(gettext) inside array'))
    ];

    /// Comment with no translations, ignore this comment too
});
