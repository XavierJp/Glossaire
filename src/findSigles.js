import { createMatchNode, createTextNode } from "./render";

export function parseText(text, siglesIndex) {
  var textToParse = text;
  var parsedText = [];

  // every non characters is considerd a stop words. Archaic but fast
  const regex = /[^a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ_-]/;

  var index = {};
  var cursorPosition = 0;
  for (var i = 0; i < text.length; i++) {
    var isBoundary = text[i].match(regex);
    if (isBoundary) {
      var word = text.substring(cursorPosition, i);
      if (word.length > 1 && siglesIndex[word]) {
        if (!index[word]) {
          index[word] = [];
        }
        index[word].push(cursorPosition);
      }
      cursorPosition = i + 1;
    }
  }

  // last character
  if (cursorPosition < text.length) {
    var word = text.substring(cursorPosition, i);
    if (word.length > 1 && siglesIndex[word]) {
      if (!index[word]) {
        index[word] = [];
      }
      index[word].push(cursorPosition);
    }
  }

  var matches = [];
  var words = Object.keys(index);
  for (var i = 0; i < words.length; i++) {
    var matchedWord = words[i];
    for (var u = 0; u < index[matchedWord].length; u++) {
      matches.push([index[matchedWord][u], matchedWord]);
    }
  }
  // sort in order to ensure we can make a check for no overlap
  matches.sort((a, b) => (a[0] < b[0] ? -1 : 1));

  var lastPosition = 0;
  for (var i = 0; i < matches.length; i++) {
    var position = matches[i][0];

    // make the no overlap check
    if (position > lastPosition || lastPosition === 0) {
      parsedText.push(createTextNode(text.slice(lastPosition, position)));
      parsedText.push(createMatchNode(matches[i][1]));
      lastPosition = position + matches[i][1].length;
      textToParse = text.slice(lastPosition);
    }
  }
  parsedText.push(createTextNode(textToParse));
  return parsedText;
}

export function parseDOM(node, siglesIndex) {
  // exclude these node
  if (["A", "ABBR"].indexOf(node.nodeName) > -1) {
    return;
  }

  // exclude Glossaire
  if (node.id && node.id === wrapperId) {
    return;
  }

  // exclude term definition
  if (
    node.className &&
    typeof node.className === "string" &&
    node.className.indexOf("glossary-definition") > -1
  ) {
    return;
  }

  // exclude already parsed char
  if (
    node.className &&
    typeof node.className === "string" &&
    node.className.indexOf("glossary-term-match") > -1
  ) {
    return;
  }

  var children = node.childNodes;
  for (var i = 0; i < children.length; i++) {
    var childNode = children[i];
    if (childNode.nodeName === "#text") {
      var parsedText = parseText(childNode.data, siglesIndex);
      if (parsedText.length > 1) {
        for (var i = 0; i < parsedText.length; i++) {
          node.insertBefore(parsedText[i], childNode);
        }
        node.removeChild(childNode);
      }
    } else {
      parseDOM(childNode, siglesIndex);
    }
  }
}
