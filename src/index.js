import definitions from './sigles';

(function glossaireInterfaceInit() {
  // https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid/2117523#2117523
  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  var wrapperId = 'a' + uuidv4();
  var resultsId = 'a' + uuidv4();
  var inputId = 'a' + uuidv4();

  function createMatch(text) {
    var match = document.createElement('span');
    match.className = 'glossary-term-match';
    match.innerHTML = text + ' 📖';
    match.style.borderBottom = '1px dotted';
    match.onclick = function() {
      window.glossaireInterface.search(text);
    };
    match.style.cursor = 'help';
    return match;
  }
  function createText(text) {
    return document.createTextNode(text);
  }
  function createResultNode(definition) {
    var node = document.createElement('div');
    node.innerHTML = `
    <div>
      <p><b>${definition.term} :</b> ${definition.definition}</p>
      <a href="definition.url_source"><i>Source : ${definition.source}</i></a>
    </div>`;
    return node;
  }

  function createWrapper() {
    var wrapper = document.createElement('div');
    wrapper.id = wrapperId;
    wrapper.innerHTML =
      // lets build this only on click, not to interfere with SEO
      `
      <style>
        #${wrapperId} h2, #${wrapperId} p, #${wrapperId} a, #${wrapperId} input[type='text'] {
          padding:0;
          margin:0;
        }

        #${wrapperId} {
          font-size:1rem;
          color:#f3f3f3 !important;
          position:fixed;
          right:0;
          top:0;
          height:100vh;
          width:100%;
          max-width:350px;
          z-index:10000000;
          background-color: #071728;
          padding:20px 35px;
        }

        #${wrapperId} .close {
          display:flex;
          justify-content:flex-end;
          cursor:pointer;
        }

        #${wrapperId} > div > h2 {
          color: #f3f3f3;
          font-size:1.6rem;
          font-line: 2rem;
          padding-bottom: 10px;
          margin: 10px 0 10px 0;
          width:100%;
          border-bottom:1px dashed #536373;
        }

        #${wrapperId} p {
          margin:10px 0 10px 0;
        }

        #${wrapperId} a {
          color:#f3f3f3 !important;
          text-decoration:underline;
          font-size:0.9rem;
        }

        #${wrapperId} .definitions {
          margin:20px 0 20px 0;
        }
        #${wrapperId} .definitions > div:not(:last-of-type) {
          padding-bottom:20px;
          margin: 15px 0;
          border-bottom: 1px solid #373f48;
        }

        #${wrapperId} input[type='text'] {
          width:100%;
          border-radius:2px;
          margin:10px 0;
          padding:3px 5px;
          line-height: 1.8rem;
          font-size:1rem;
          border: none;
          outline:none;
        }
      </style>
      <div>
        <div class="close" onclick='window.glossaireInterface.hide()'><span>Fermer ✖︎</span></div>
        <h2>Glossaire</h2>
        <p>Ce glossaire contient des définitions de termes, de sigles et d’acronymes communément utilisés sur les sites des services publics.</p>
        <input id="${inputId}" type="text" placeholder="Rechercher une définition" value="DGFiP" />
        <div id="${resultsId}" class="definitions">
        </div>
      </div>
    `;
    return wrapper;
  }

  var mostWanted = [
    ...new Set(
      definitions.map(function(definition) {
        return definition.term;
      })
    ),
  ];

  function parseText(text) {
    var textToParse = text;
    var parsedText = [];

    const regex = /[^a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ_-]/;

    var index = {};
    var cursorPosition = 0;
    for (var i = 0; i < text.length; i++) {
      var isBoundary = text[i].match(regex);
      if (isBoundary) {
        var word = text.substring(cursorPosition, i);
        if (word.length > 1) {
          if (!index[word]) {
            index[word] = [];
          }
          index[word].push(cursorPosition);
        }
        cursorPosition = i + 1;
      }
    }
    // last char ?
    if (cursorPosition < text.length) {
      var word = text.substring(cursorPosition, i);
      if (word.length > 1) {
        if (!index[word]) {
          index[word] = [];
        }
        index[word].push(cursorPosition);
      }
    }

    var matches = [];
    for (var i = 0; i < mostWanted.length; i++) {
      var word = mostWanted[i];
      if (index[word]) {
        for (var u = 0; u < index[word].length; u++) {
          matches.push([index[word][u], word]);
        }
      }
    }
    matches.sort((a, b) => (a[0] < b[0] ? -1 : 1));

    var lastPosition = 0;
    for (var i = 0; i < matches.length; i++) {
      var position = matches[i][0];
      if (position > lastPosition || lastPosition === 0) {
        parsedText.push(createText(text.slice(lastPosition, position)));
        parsedText.push(createMatch(matches[i][1]));
        lastPosition = position + matches[i][1].length;
        textToParse = text.slice(lastPosition);
      }
    }
    parsedText.push(createText(textToParse));
    return parsedText;
  }

  function parseDOM(node) {
    // exclude these node
    if (['A'].indexOf(node.nodeName) > -1) {
      return;
    }

    // exclude Glossaire
    if (node.id && node.id === wrapperId) {
      return;
    }

    // exclude already parsed char
    if (
      node.className &&
      typeof node.className === 'string' &&
      node.className.indexOf('glossary-term-match') > -1
    ) {
      return;
    }

    var children = node.childNodes;
    for (var i = 0; i < children.length; i++) {
      var childNode = children[i];
      if (childNode.nodeName === '#text') {
        var parsedText = parseText(childNode.data);
        if (parsedText.length > 1) {
          for (var i = 0; i < parsedText.length; i++) {
            node.insertBefore(parsedText[i], childNode);
          }
          node.removeChild(childNode);
        }
      } else {
        parseDOM(childNode);
      }
    }
  }

  function init() {
    var wrapper = createWrapper();
    var showGlossaire = false;

    // expose Glossary manipulation functions
    window.glossaireInterface = {
      search: function(searchTerm) {
        if (!showGlossaire) {
          window.glossaireInterface.show();
        }
        var input = document.getElementById(inputId);
        input.value = searchTerm;

        var resultsWrapper = document.getElementById(resultsId);
        resultsWrapper.innerHTML = '';

        var definitionResults = definitions.reduce((results, definition) => {
          if (definition.term === searchTerm) {
            results.push(createResultNode(definition));
          }
          return results;
        }, []);

        for (var i = 0; i < definitionResults.length; i++) {
          resultsWrapper.appendChild(definitionResults[i]);
        }
      },
      hide: function() {
        document.body.removeChild(wrapper);
        showGlossaire = false;
      },
      show: function() {
        document.body.appendChild(wrapper);
        showGlossaire = true;
      },
    };

    // add listners for dynamic app that might repaint the DOM (react, vue)

    window.parsingForSIGLE = false;
    var callback = function() {
      if (!window.parsingForSIGLE) {
        window.parsingForSIGLE = true;

        var eligibleTags = ['P', 'LI', 'TR'];

        for (var i = 0; i < eligibleTags.length; i++) {
          var tags = document.getElementsByTagName(eligibleTags[i]);

          for (var tagIndx = 0; tagIndx < tags.length; tagIndx++) {
            parseDOM(tags[tagIndx]);
          }
        }

        console.log('Parsing DOM');
        window.setTimeout(function() {
          window.parsingForSIGLE = false;
        }, 300);
      }
    };
    const observerOptions = {
      childList: true,
      attributes: true,
      subtree: true,
    };

    const observer = new MutationObserver(callback);
    observer.observe(document.body, observerOptions);

    // let's do this !
    callback();
  }

  init();
})();
