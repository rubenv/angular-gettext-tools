
async function run () {
  const { default: exportTestDefault, exportTest } = await import('./es6-export')
  const fromDefaultExport = exportTestDefault(); // should be ignored
  const fromExport = exportTest(); // should be ignored
  gettext('Hi from ES6 file with dynamic import!');
}

run()
