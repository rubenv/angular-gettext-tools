var langTemplate, po, template;

po = require('node-po');

template = function(module, body) {
  return "angular.module(\"" + module + "\").run(['gettextCatalog', function (gettextCatalog) {\n" + body + "\n}]);";
};

langTemplate = function(language, strings) {
  return "    gettextCatalog.setStrings('" + language + "', " + (JSON.stringify(strings)) + ");\n";
};

module.exports = function(grunt) {
  return grunt.registerMultiTask('nggettext_compile', 'Compile strings from .po files', function() {
    var options;
    options = this.options({
      module: 'gettext'
    });
    return this.files.forEach(function(file) {
      var body;
      body = '';
      file.src.forEach(function(input) {
        var catalog, data, item, strings, _i, _len, _ref;
        data = grunt.file.read(input);
        catalog = po.parse(data);
        if (!catalog.headers.Language) {
          throw new Error('No Language header found!');
        }
        strings = {};
        _ref = catalog.items;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          strings[item.msgid] = item.msgstr.length === 1 ? item.msgstr[0] : item.msgstr;
        }
        return body += langTemplate(catalog.headers.Language, strings);
      });
      return grunt.file.write(file.dest, template(options.module, body));
    });
  });
};
