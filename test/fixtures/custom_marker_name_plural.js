window._n = function(n, str, plural) { return n === 1 ? str : plursal; };

angular.module("myApp").controller("customController", function (gettext) {
    var myString = _n(1, "Hello custom singular", "Hello custom plural");
});
