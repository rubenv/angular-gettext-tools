class TestController {
  classProperty = 1;

  constructor(gettext) {
    var myString = gettext("Hi from an ES6 class!");

    this.bindedMethod = ::this.method;

    const component = <Component attr={true} />;

    const a = { a: 1 };
    const b = { b: 2 };

    const c = { ...a, ...b };
  }

  @test
  method () { }
}
