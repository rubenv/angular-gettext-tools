angular.module("myApp").controller("helloController", function (gettextCatalog) {
    var myString = gettextCatalog.getString("Hello");
    var myString2 = gettextCatalog.getString("Hello2", null, "Context");
    var myString3 = gettextCatalog.getPlural(3, "Bird", "Birds");
    var myString4 = gettextCatalog.getPlural(3, "Bird2", "Birds2", null, "Context2");
});
