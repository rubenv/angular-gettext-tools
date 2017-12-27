const Test = () => (
    <div>
        <h1><span>{gettext("Hello World")}</span></h1>
        <p>
            {gettext(`One
Two
Three`)}
        </p>
    </div>
);
