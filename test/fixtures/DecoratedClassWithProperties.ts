function CustomDecorator(value: string) {
    return function (target) { }
}

@CustomDecorator('CustomValue')
export class DecoratedClassWithProperties {
    protected a: string;

    constructor(gettext) {
        this.a = gettext("A Hello");
    }
}

