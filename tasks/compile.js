module.exports = function(grunt) {
  return grunt.registerMultiTask('nggettext_compile', 'Compile strings from .po files', function() {
    return console.log(this.files);
  });
};
