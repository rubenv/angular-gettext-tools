angular.module("myApp").config(["$routeProvider", function ($routeProvider) {
    $routeProvider.
        when("/users", {
            title: "{{ 'Users' | translate }}"
        })
}]);