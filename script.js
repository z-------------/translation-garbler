const API_KEY = "trnsl.1.1.20170707T233840Z.6f882fefd3b2f5f7.75dbfcb680b9de09a63ca83d2d67c041371f95b8";
const API_URL = "https://translate.yandex.net/api/v1.5/tr.json/translate";

const LANGS = [
  "az", "ml", "sq", "mt", "am", "mk", "en", "mi", "ar", "mr", "hy", "mhr",
  "af", "mn", "eu", "de", "ba", "ne", "be", "no", "bn", "pa", "my", "pap",
  "bg", "fa", "bs", "pl", "cy", "pt", "hu", "ro", "vi", "ru", "ht", "ceb",
  "gl", "sr", "nl", "si", "mrj", "sk", "el", "sl", "ka", "sw", "gu", "su",
  "da", "tg", "he", "th", "yi", "tl", "id", "ta", "ga", "tt", "it", "te",
  "is", "tr", "es", "udm", "kk", "uz", "kn", "uk", "ca", "ur", "ky", "fi",
  "zh", "fr", "ko", "hi", "xh", "hr", "km", "cs", "lo", "sv", "la", "gd",
  "lv", "et", "lt", "eo", "lb", "jv", "mg", "ja", "ms"
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

function translate(text, toLang, callback) {
  var reqURL = makeGETURL(API_URL, {
    key: API_KEY, text: text, lang: toLang
  });

  jsonp(reqURL, function(res) {
    console.log(res)
    callback({ code: res.code, text: res.text[0] });
  });
}

// now let's roll

var inputElem = document.getElementById("trans-input");
var outputElem = document.getElementById("trans-output");
var submitElem = document.getElementById("trans-submit");

function translateChain(text, length, intermediateCallback) {
  var counter = 0;

  function next(lastText) {
    var lang;
    if (counter === length - 1) {
      lang = "en";
    } else {
      lang = LANGS[Math.floor(Math.random() * LANGS.length)];
    }
    console.log(lang)
    translate(lastText, lang, function(res) {
      counter += 1;
      intermediateCallback(res.text);
      if (counter !== length) {
        next(res.text);
      }
    });
  }

  next(text);
}

submitElem.onclick = function() {
  outputElem.innerHTML = "";
  translateChain(inputElem.value, 10, function(intermediateText) {
    outputElem.innerHTML += intermediateText + "<br><br>";
  })
};
