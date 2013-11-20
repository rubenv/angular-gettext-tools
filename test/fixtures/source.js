angular.module("myApp").controller("helloController", function (gettext) {
    var myString = gettext("Hello");
    gettext(); // Should be ignored.
});
