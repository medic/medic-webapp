const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const MAP_ARG_NAME = 'doc';

module.exports.loadView = (ddocName, viewName, saveValues = false, reset = false) => {
  const mapString = fs.readFileSync(path.join(
    __dirname,
    '../../../../src/ddocs',
    ddocName,
    'views',
    viewName,
    '/map.js'), 'utf8');

  const mapScript = new vm.Script('(' + mapString + ')(' + MAP_ARG_NAME + ');');

  const emitted = [];
  const context = new vm.createContext({
    emitted: emitted,
    emit: function(key, value) {
      if (!saveValues) {
        return emitted.push(key);
      }
      emitted.push({ key: key, value: value });
    }
  });

  return (doc) => {
    if (reset) {
      emitted.splice(0, emitted.length);
    }
    context[MAP_ARG_NAME] = doc;
    mapScript.runInContext(context);
    return context.emitted;
  };
};

module.exports.assertIncludesPair = (array, pair) => {
  assert.ok(array.find((keyArray) => keyArray[0] === pair[0] && keyArray[1] === pair[1]));
};

module.exports.assertDoesNotIncludePair = (array, pair) => {
  assert.ok(!array.find((keyArray) => keyArray[0] === pair[0] && keyArray[1] === pair[1]));
};
