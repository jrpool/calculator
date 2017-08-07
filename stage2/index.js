// Define a function to update and retrieve the session state.
var state = (function () {
  var state = {
    currentNumString: '0',
    currentOp: undefined,
    lastTerms: []
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
  var canonicalNumString = function canonicalNumString(numString, showAll) {
    if (showAll) {
      return numString;
    }
    else if (numString.includes('.')) {
      return numString.replace(/[.]?0+$/, '').replace(/^-/, '–');
    }
    else {
      return numString;
    }
  }
  var showState = function showState() {
    trimState();
    var lastTermsString = state.lastTerms.map(array => array[1]).join(' ');
    var currentString = (
      state.currentOp || canonicalNumString(state.currentNumString, true)
    );
    var newText
      = (lastTermsString ? lastTermsString + ' ' : '') + currentString;
    var result = document.getElementById('result');
    result.innerText = newText;
    var fontSizeString = (
      newText.length > 8 ? Math.ceil(1800 / newText.length) : 225
    ).toString() + '%';
    document.getElementById('result').style.fontSize = fontSizeString;
  };
  var takeDigit = function takeDigit(digitString) {
    if (state.currentOp) {
      state.currentNumString = digitString;
      state.lastTerms.push(['op', state.currentOp]);
      state.currentOp = undefined;
    }
    else if (digitString === '0' && state.currentNumString !== '0') {
      state.currentNumString += '0';
    }
    else if (digitString !== '0') {
      if (state.currentNumString === '0') {
        state.currentNumString = digitString;
      }
      else {
        state.currentNumString += digitString;
      }
    }
  // Ignore '0' if current number string is '0'.
  };
  var signInvert = function signInvert(numString) {
    if (numString.length) {
      if (numString[0] === '–') {
        return numString.slice(1);
      }
      else {
        return '–' + numString;
      }
    }
    else {
      return '';
    }
  }
  var doOp = function doOp () {
    var op = state.lastTerms[1][1];
    var term0 = Number.parseFloat(state.lastTerms[0][1].replace(/–/, '-'));
    var term1 = Number.parseFloat(state.currentNumString.replace(/–/, '-'));
    var result;
    if (op === '+') {
      result = term0 + term1;
    }
    else if (op === '–') {
      result = term0 - term1;
    }
    else if (op === '×') {
      result = term0 * term1;
    }
    // Precondition: dividend is not 0.
    else if (op === '÷') {
      result = term0 / term1;
    }
    if (result === undefined) {
      return '';
    }
    else {
      return canonicalNumString(
        result.toString().replace(/^-/, '–'), false
      );
    }
  };
  var takeOp = function takeOp(op) {
    if (op === '+/–') {
      // Ignore '+/–' unless current item is a number.
      if (state.currentNumString) {
        state.currentNumString = signInvert(state.currentNumString);
      }
    }
    else if (['+', '–', '×', '÷'].includes(op)) {
      state.currentOp = op;
      if (state.currentNumString) {
        // If this op applies to the result of an op not yet computed:
        if (state.lastTerms.length) {
          // Compute and store it, unless it would be division by 0.
          if (
            state.lastTerms[1] !== '/'
            || canonicalNumString(state.currentNumString, false) !== '0'
          ) {
            var opResult = doOp();
            if (opResult.length) {
              state.lastTerms.push(
                ['num', canonicalNumString(opResult, false)]
              );
            }
          }
        }
        // If this op applies to the first and only number, store the number.
        else {
          state.lastTerms.push(
            ['num', canonicalNumString(state.currentNumString, false)]
          );
        }
        state.currentNumString = undefined;
      }
    }
  // Temporarily ignore other ops.
  };
  var takeDot = function takeDot() {
    if (state.currentOp) {
      state.lastTerms.push(['op', state.currentOp])
      state.currentOp = undefined;
      state.currentNumString = '0.';
    }
    else if (! state.currentNumString.includes('.')) {
      state.currentNumString += '.';
    }
  // Ignore dot if not first in current number.
  };
  return {
    show: showState,
    takeDigit: takeDigit,
    takeDot: takeDot,
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
      return element.previousElementSibling.firstElementChild.innerText;
    }
    else {
      return element.firstElementChild.innerText;
    }
  }
  else if (classList.includes('calculator-button')) {
    return element.firstElementChild.innerText;
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
  if (/^[0-9]$/.test(symbol)) {
    state.takeDigit(symbol);
    state.show();
  }
  else if (symbol === '.') {
    state.takeDot();
    state.show();
  }
  else if (
    ['C', 'AC', '⌫', '=', '+/–', '%', '÷', '×', '–', '+'].includes(symbol)
  ) {
    state.takeOp(symbol);
    state.show();
  }
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
    '–': '+/–',
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
    '+': '+',
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
// Ignore irrelevant key presses.
};

// Event listeners
document.getElementById('buttons0').addEventListener('click', clickRespond);
window.addEventListener('keydown', keyRespond);
