angular.module("myApp").controller("helloController", function (gettext) {
    gettext(); // Should be ignored.
    var myString = gettextCatalog.getString("Hello!");
    var myStringContext2 = gettextCatalog.getString("Hello!", null, "female");
    var myString2Context1 = gettextCatalog.getPlural(3, "Bird", "Birds", null, "cage");
    var myString2Context2 = gettextCatalog.getPlural(3, "Bird", "Birds", null, "free");
    
});
