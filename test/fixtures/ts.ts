angular.module("myApp").controller("helloController", (gettext) => {
    var myString: string = gettext("Hello");
    var longString: string = gettext(`One
Two
Three`);
    gettext(); // Should be ignored.
});
