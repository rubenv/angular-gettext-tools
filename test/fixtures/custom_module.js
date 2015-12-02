angular.module("myApp").controller("helloController", function (LabelService) {
    var myString = LabelService.getString("Hello");
});
