angular.module("myApp").controller("helloController", function (gettextCatalog) {
    var myString = gettextCatalog.getTranslation("Hello");
});
