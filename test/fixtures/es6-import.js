import exportTestDefault, { exportTest } from './es6-export';

const fromDefaultExport = exportTestDefault(); // should be ignored
const fromExport = exportTest(); // should be ignored
gettext('Hi from ES6 file with import!');
