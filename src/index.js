import { uuidv4 } from "./utils";
import { createResultNode, createWrapperNode } from "./render";
import { initSigles } from "./sigles";
import { parseDOM } from "./findSigles";

(function glossaireInterfaceInit() {
  var params = document.getElementById("glossaire-betalab-params") || null;

  // starts id with a letter
  var wrapperId = "a" + uuidv4();
  var resultsId = "a" + uuidv4();
  var searchTermId = "a" + uuidv4();

  var dynamicRepaint = params && params.getAttribute("data-dynamic-repaint");

  var parseClasses = params
    ? (params.getAttribute("data-parse-classes") || "").split(",")
    : [];

  var excludeSigles = params
    ? (params.getAttribute("data-exclude-sigles") || "").split(",")
    : [];

  var sigles = initSigles(excludeSigles);

  function init() {
    var wrapper = createWrapperNode(wrapperId, searchTermId, resultsId);
    var showGlossaire = false;
    var lastSearchTerm = "";

    // expose Glossary manipulation functions
    window.glossaireInterface = {
      search: function (searchTerm) {
        if (
          showGlossaire &&
          lastSearchTerm === searchTerm &&
          searchTerm !== ""
        ) {
          window.glossaireInterface.hide();
          lastSearchTerm = searchTerm;
          return;
        }
        if (!showGlossaire) {
          window.glossaireInterface.show();
        }

        lastSearchTerm = searchTerm;

        var resultsWrapper = document.getElementById(resultsId);
        resultsWrapper.innerHTML = "";

        var term = document.getElementById(searchTermId);
        term.innerHTML = searchTerm;

        var definitionResults = sigles.find(searchTerm).map(function (result) {
          return createResultNode(result[0], result[1], result[2]);
        });

        for (var i = 0; i < definitionResults.length; i++) {
          resultsWrapper.appendChild(definitionResults[i]);
        }
      },
      hide: function () {
        document.body.removeChild(wrapper);
        showGlossaire = false;
      },
      show: function () {
        document.body.appendChild(wrapper);
        showGlossaire = true;
      },
    };

    // add listners for dynamic app that might repaint the DOM (react, vue)
    window.parsingForSIGLE = false;
    var callback = function () {
      if (!window.parsingForSIGLE) {
        window.parsingForSIGLE = true;

        var eligibleTags = ["P", "LI", "TR"];

        for (var i = 0; i < eligibleTags.length; i++) {
          var tags = document.getElementsByTagName(eligibleTags[i]);

          for (var tagIndx = 0; tagIndx < tags.length; tagIndx++) {
            parseDOM(tags[tagIndx], sigles.index);
          }
        }

        if (parseClasses) {
          for (var i = 0; i < parseClasses.length; i++) {
            var elems = document.getElementsByClassName(parseClasses[i]);

            for (var elIdx = 0; elIdx < elems.length; elIdx++) {
              parseDOM(elems[elIdx], sigles.index);
            }
          }
        }

        // we could use a short 50ms debounce here but it might lower pagespeed score
        // on the opposite, a throttle might break things in a SPA
        window.parsingForSIGLE = false;
      }
    };
    const observerOptions = {
      childList: true,
      attributes: true,
      subtree: true,
    };

    if (dynamicRepaint) {
      const observer = new MutationObserver(callback);
      observer.observe(document.body, observerOptions);
    }

    for (var i = 0; i < 10; i++) {
      callback();
    }

    // let's do this !
    callback();
  }

  init();
})();
