var $, jquery, po,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

jquery = require('jquery');

po = require('node-po');

$ = jquery.create();

module.exports = function(grunt) {
  return grunt.registerMultiTask('nggettext_extract', 'Extract strings from views', function() {
    return this.files.forEach(function(file) {
      var addString, catalog, failed, key, string, strings;
      failed = false;
      catalog = new po();
      strings = {};
      addString = function(file, string, plural) {
        var item;
        if (plural == null) {
          plural = null;
        }
        if (!strings[string]) {
          strings[string] = new po.Item();
        }
        item = strings[string];
        item.msgid = string;
        if (__indexOf.call(item.references, file) < 0) {
          item.references.push(file);
        }
        if (plural && plural !== '') {
          if (item.msgid_plural && item.msgid_plural !== plural) {
            grunt.log.error("Incompatible plural definitions for " + string + ": " + item.msgid_plural + " / " + plural + " (in: " + (item.references.join(", ")) + ")");
            failed = true;
          }
          item.msgid_plural = plural;
          return item.msgstr = ["", ""];
        }
      };
      file.src.forEach(function(input) {
        var src;
        src = grunt.file.read(input);
        return $(src).find('*[translate]').each(function(index, n) {
          var node, plural, str;
          node = $(n);
          if (!node.attr('translate')) {
            return;
          }
          str = node.html();
          plural = node.attr('translate-plural');
          return addString(input, str, plural);
        });
      });
      for (key in strings) {
        string = strings[key];
        catalog.items.push(string);
      }
      if (!failed) {
        return grunt.file.write(file.dest, catalog.toString());
      }
    });
  });
};
