angular.module("myApp").controller("helloController", function (gettextCatalog) {
    var obj = {[
        gettextCatalog: gettextCatalog };
    var myString = obj.gettextCatalog.getString("Hello");
    var myString2 = obj.gettextCatalog.getPlural(3, "Bird", "Birds");
});
