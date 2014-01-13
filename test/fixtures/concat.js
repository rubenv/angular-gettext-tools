angular.module("myApp").controller("helloController", function (gettext) {
    var myString = gettext("Hello" + " one concat!");
    var myString = gettext("Hello" + " two "+ "concat!");
});
