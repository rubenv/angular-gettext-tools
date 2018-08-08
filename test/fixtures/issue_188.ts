angular.module("myApp").controller("helloController", (gettext, gettextCatalog) => {
    var simpleString: string = gettext("constructor");
    var catalogString: string = gettextCatalog.getString("constructor");
});
