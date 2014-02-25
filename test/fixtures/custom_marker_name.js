window.__ = function(str) { return str; };

angular.module("myApp").controller("customController", function (gettext) {
    var myString = __("Hello custom");
});
