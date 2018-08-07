angular.module("myApp").controller("helloController", (gettext) => {
    var myString: string = gettext("Hello");
    var longString: string = gettext(`One
Two
Three`);
    var castedVar: any = <any> gettext("Casted");
    gettext(); // Should be ignored.
});
