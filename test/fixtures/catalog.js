angular.module("myApp").controller("helloController", function (gettextCatalog) {
    var myString = gettextCatalog.getString("Hello");
    var myString2 = gettextCatalog.getPlural(3, "Bird", "Birds");
    var myString3 = gettextCatalog.getInterpolatedString("Hello {{name}}!", { name: "Andrew" });
    var myString4 = gettextCatalog.getInterpolatedPlural(3, "There is {{number}} bird", "There are {{number}} birds", { number: 3 });
});
