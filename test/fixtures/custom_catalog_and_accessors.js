angular.module("myApp").controller("helloController", function (myGettextCatalog) {
    var myString = myGettextCatalog.getTranslation("Hello");
    var myString2 = myGettextCatalog.getPluralTranslation(3, "Bird", "Birds");
});
