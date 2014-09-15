angular.module("myApp").controller("helloController", function (myGettextCatalog) {
    var myString = myGettextCatalog.getString("Hello");
    var myString2 = myGettextCatalog.getPlural(3, "Bird", "Birds");
});
