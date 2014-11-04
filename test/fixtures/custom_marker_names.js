angular.module("myApp").controller("customController", function (gettext) {
    var myString = gettext("Hello default");
    // Should be ignored.
    gettext();

    showError("Hello first custom");
    showSuccess("Hello second custom");

    function showError(str) { }
    function showSuccess(str) { }
});
