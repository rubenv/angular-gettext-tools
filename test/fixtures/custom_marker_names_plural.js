angular.module("myApp").controller("customController", function (gettext) {
    var myString = gettext("Hello default");
    // Should be ignored.
    gettext();

    showErrors(1, "Hello first custom singular", "Hello first custom plural");
    showSuccesses(1, "Hello second custom singular", "Hello second custom plural");

    function showError(str) { }
    function showSuccess(str) { }
});
