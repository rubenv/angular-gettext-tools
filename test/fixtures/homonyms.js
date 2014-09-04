angular.module("myApp").controller("helloController", function (gettext) {
    gettext(); // Should be ignored.
    var myStringContext1 = gettextCatalog.getString("Hello!", null, "male");
    var myStringContext2 = gettextCatalog.getString("Hello!", null, "female");
    var myString2Context1 = gettextCatalog.getPlural(3, "Bird", "Birds", null, "cage");
    var myString2Context2 = gettextCatalog.getPlural(3, "Bird", "Birds", null, "free");
    
});
