import sigles from "../data/sigles.json";

export var initSigles = function (exclusionList) {
  var lookFor = sigles.definitions
    .reduce(function (list, definition) {
      var sigle = definition[0];
      if (list.indexOf(sigle) === -1) {
        list.push(sigle);
      }
      return list;
    }, [])
    .filter((e) => exclusionList.indexOf(e) === -1);

  // create an index of sigles for fast access
  var lookForIndex = lookFor.reduce((index, word) => {
    index[word] = 1;
    return index;
  }, {});

  return {
    find: function (searchTerm) {
      return sigles.definitions.reduce((results, definition) => {
        if (definition[0] === searchTerm) {
          results.push([definition[1], ...sigles.sources[definition[2]]]);
        }

        return results;
      }, []);
    },
    list: lookFor,
    index: lookForIndex,
  };
};
