angular.module("myApp").controller("helloController", function (gettext) {
    /// B
    /// A
    gettext('0');

    /// A
    /// B
    gettext('0');

    /// B
    /// A
    gettext('1');
});
