// Define a function to update and retrieve the session state.
var state = (function () {
  var state = {
    lastTerms: [],
    currentNum: 0,
    currentOp: undefined
  };
  var trimState = function trimState() {
    var termCount = state.lastTerms.length;
    if (termCount > 2) {
      state.lastTerms.splice(0, termCount - 2);
      termCount = 2;
    }
    if (termCount === 2 && state.lastTerms[0][0] === 'op') {
      state.lastTerms.shift();
    }
  };
  var showState = function showState() {
    trimState();
    var current = state.currentOp || Number.parseInt(state.currentNum);
    var newText = state.lastTerms.map(array => array[1]).join('') + current;
    var result = document.getElementById('result');
    result.innerText = newText;
    if (newText.length > 8) {
      document.getElementById('result').style.fontSize
        = Math.ceil(1800 / newText.length) + '%';
    }
  };
  var takeDigit = function takeDigit(digit) {
    if (state.currentNum !== undefined) {
      state.currentNum = 10 * state.currentNum + digit;
    }
    else if (state.currentOp !== undefined) {
      state.currentNum = digit;
      state.lastTerms.push(['op', state.currentOp]);
      state.currentOp = undefined;
    }
    else {
      state.currentNum = digit;
    }
  };
  var takeOp = function takeOp(op) {
    state.currentOp = op;
    if (state.currentNum !== undefined) {
      state.lastTerms.push(['num', state.currentNum]);
      state.currentNum = undefined;
    }
  };
  return {
    show: showState,
    takeDigit: takeDigit,
    takeOp: takeOp
  };
})();

/*
  Define a function to return the text imputable to an element in the
  interactive section of the calculator.
*/
var imputedText = function imputedText(element) {
  var classList = element.className.split(' ');
  if (classList.includes('text')) {
    return element.textContent;
  }
  else if (classList.includes('calculator-button-area')) {
    if (classList.includes('vacant')) {
      return element.previousElementSibling.innerText;
    }
    else {
      return element.innerText;
    }
  }
  else if (classList.includes('calculator-button')) {
    return element.innerText;
  }
  else if (element.tagName.toLowerCase() === 'span') {
    return element.parentNode.innerText;
  }
  else {
    return '';
  }
};

// Define a function to respond to a button or key input.
var inputRespond = function inputRespond(symbol) {
  var symbolAsDigit = Number.parseInt(symbol);
  if (Number.isInteger(symbolAsDigit)) {
    state.takeDigit(symbolAsDigit);
  }
  else {
    state.takeOp(symbol);
  }
  state.show();
};

// Define a function to respond to a button click.
var clickRespond = function clickRespond(event) {
  inputRespond(imputedText(event.target));
};

// Define a function to respond to a keyboard keypress.
var keyRespond = function keyRespond(event) {
  var buttonKeys = {
    'Clear': 'C',
    'Escape': ['C', 'AC'],
    'Dead': 'AC',
    'Backspace': '⌫',
    'Enter': '=',
    '–': '+∕−',
    '%': '%',
    '/': '÷',
    '7': '7',
    '8': '8',
    '9': '9',
    '*': '×',
    '4': '4',
    '5': '5',
    '6': '6',
    '-': '–',
    '1': '1',
    '2': '2',
    '3': '3',
    '0': '0',
    '.': '.',
    '=': '=',
  };
  if (Object.keys(buttonKeys).includes(event.key)) {
    var meaning = buttonKeys[event.key];
    if (Array.isArray(meaning)) {
      meaning = meaning[event.altKey ? 1 : 0];
    }
    inputRespond(meaning);
  }
};

// Event listeners
document.getElementById('buttons0').addEventListener('click', clickRespond);
window.addEventListener('keydown', keyRespond);
