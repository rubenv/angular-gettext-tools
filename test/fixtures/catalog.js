angular.module("myApp").controller("helloController", function (gettextCatalog) {
    var myString = gettextCatalog.getString("Hello");
    var myString2 = gettextCatalog.getPlural(3, "Bird", "Birds");
});
