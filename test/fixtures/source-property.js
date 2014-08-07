var HelloController = function (gettext) {
    this.gettext = gettext;

    this.someProperties = [
        this.gettext("Hello"),
        this.gettext("World"),
    ];
};

HelloController.prototype.someFunction = function () {
    return this.gettext("Hello world");
};

angular.module("myApp").controller("helloController", HelloController);
