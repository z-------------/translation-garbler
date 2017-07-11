const API_KEY = "trnsl.1.1.20170707T233840Z.6f882fefd3b2f5f7.75dbfcb680b9de09a63ca83d2d67c041371f95b8";
const API_URL = "https://translate.yandex.net/api/v1.5/tr.json/translate";

const LANGS_ALL = [
  "az", "ml", "sq", "mt", "am", "mk", "mi", "ar", "mr", "hy", "mhr",
  "af", "mn", "eu", "de", "ba", "ne", "be", "no", "bn", "pa", "my", "pap",
  "bg", "fa", "bs", "pl", "cy", "pt", "hu", "ro", "vi", "ru", "ht", "ceb",
  "gl", "sr", "nl", "si", "mrj", "sk", "el", "sl", "ka", "sw", "gu", "su",
  "da", "tg", "he", "th", "yi", "tl", "id", "ta", "ga", "tt", "it", "te",
  "is", "tr", "es", "udm", "kk", "uz", "kn", "uk", "ca", "ur", "ky", "fi",
  "zh", "fr", "ko", "hi", "xh", "hr", "km", "cs", "lo", "sv", "la", "gd",
  "lv", "et", "lt", "eo", "lb", "jv", "mg", "ja", "ms"
];

const LANGS_GOOD = [
  "es", "zh", "ru", "be", "uk", "kk", "ja", "ko", "pl", "fr", "eo", "pt", "de", "it", "nl", "vi"
];

const DEFAULT_TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "A bird in the hand is worth two in the bush.",
  "Do unto others as you would have them do unto you.",
  "Don't count your chickens before they hatch.",
  "Don't put all your eggs in one basket.",
  "You can't make an omelet without breaking some eggs.",
  "Those who live in glass houses shouldn't throw stones."
];

function jsonp(url, callback) {
  var callbackName = "jsonpcallback" + new Date().getTime() + Math.round(Math.random() * 99999);
  window[callbackName] = callback;

  var scriptElem = document.createElement("script");
  scriptElem.src = url + `&callback=${callbackName}`;
  document.body.appendChild(scriptElem);
}

function makeGETURL(baseURL, params) {
  var paramsStr = "";
  for (let key of Object.keys(params)) {
    paramsStr += `${key}=${encodeURIComponent(params[key])}&`;
  }
  paramsStr.length -= 1;

  return baseURL + "?" + paramsStr;
}

function translate(text, fromLang, toLang, callback) {
  var reqURL = makeGETURL(API_URL, {
    key: API_KEY, text: text, lang: `${fromLang}-${toLang}`
  });

  jsonp(reqURL, function(res) {
    var langsArray = res.lang.split("-");
    callback({ code: res.code, fromLang: langsArray[0], toLang: langsArray[1], text: res.text[0] });
  });
}

function sanitizeHTML(inputString) {
  return inputString.replace("<", "&lt;").replace(">", "&gt;");
}

// now let's roll

var inputElem = document.getElementById("trans-input");
var outputElem = document.getElementById("trans-output");
var submitElem = document.getElementById("trans-submit");
var againElem = document.getElementById("trans-again");

inputElem.textContent = DEFAULT_TEXTS[Math.floor(Math.random() * DEFAULT_TEXTS.length)];

function translateChain(text, length, intermediateCallback) {
  var counter = 0;

  function next(lastLang, lastText) {
    var toLang;
    if (counter === length - 1) {
      toLang = "en";
    } else {
      toLang = LANGS_GOOD[Math.floor(Math.random() * LANGS_GOOD.length)];
    }
    translate(lastText, lastLang, toLang, function(res) {
      counter += 1;
      intermediateCallback(res.text, lastLang, toLang, counter === length);
      if (counter !== length) {
        next(res.toLang, res.text);
      }
    });
  }

  next("en", text);
}

submitElem.onclick = function() {
  outputElem.innerHTML = "";
  againElem.classList.add("invisible");
  translateChain(inputElem.value, 10, function(text, fromLang, toLang, isLast) {
    var pElem = document.createElement("p");
    pElem.innerHTML = `<em>${fromLang} -> ${toLang}</em>: ${sanitizeHTML(text)}`;
    if (isLast) {
      pElem.classList.add("last-translation-step");
      againElem.classList.remove("invisible");
    }
    outputElem.appendChild(pElem);
  });
};

againElem.onclick = function() {
  if (document.querySelector(".last-translation-step") != null) { // check that the current translation chain is actually finished
    var text = document.querySelector(".last-translation-step").textContent.split(": ")[1];
    inputElem.value = text;
    submitElem.click();
  }
};
