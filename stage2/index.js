/*
  Define a function that returns an initialized state.
  Properties:
    numString: string representation of most recent uncommitted number term.
    op: most recent uncommitted operator.
    terms: array of committed terms as ['op' or 'num', op or numString].
*/
var initState = (function () {
  var state = {
    numString: '',
    op: undefined,
    terms: []
  };
  return state;
};

// Define a function that returns a state with obsolete terms truncated.
var trim = function trim(state) {
  var newState = state;
  var termCount = newState.terms.length;
  if (termCount > 2) {
    newState.terms.splice(0, termCount - 2);
    termCount = 2;
  }
  if (termCount === 2 && newState.terms[0][0] === 'op') {
    newState.lastTerms.shift();
  }
  return newState;
};

// Define a function that returns a standardized numeric string.
var standardize = function standardize(numString) {
  var standardString = numString.replace(/^-/, '–');
  return standardString.includes('.')
    ? standardString.replace(/[.]?0+$/, '')
    : standardString;
}

// Define a function that displays the state in the calculator.
var show = function show(state) {
  var newState = trim(state);
  var termString = Object.values(newState.terms).join(' ');
  var pendingString = newState.op || newState.numString;
  var showString = (termString ? termString + ' ' : '') + pendingString;
  var shownResult = document.getElementById('result');
  shownResult.innerText = showString;
  var sizeSpec = (
    showString.length > 8 ? Math.ceil(1800 / showString.length) : 225
  ).toString() + '%';
  document.getElementById('result').style.fontSize = sizeSpec;
};

/*
  Define a function that responds to a digit entry, ignoring '0' entry if
  current uncommitted number string is '0'.
*/
var takeDigit = function takeDigit(state, digit) {
  if (state.op) {
    state.numString = digit;
    state.terms.push(['op', state.op]);
    state.op = undefined;
  }
  else if (digit === '0' && state.numString !== '0') {
    state.numString += '0';
  }
  else if (digit === '.' && !state.numString.includes('.')) {
    state.numString += '.';
  }
  else if (digit !== '0' && digit !== '.') {
    if (state.numString === '0') {
      state.numString = digit;
    }
    else {
      state.numString += digit;
    }
  }
};

// Define a function that inverts the sign of a numeric string.
var invert = function invert(numString) {
  if (numString.length) {
    return numString[0] === '–' ? numString.slice(1) : '–' + numString;
  }
  else {
    return '';
  }
}

/*
  Define a function that toggles the presence of a percent sign on a
  numeric string.
*/
var pctToggle = function pctToggle(numString) {
  if (numString.length) {
    return numString.endsWith('%') ? numString.slice(0, -1) : numString + '%';
  }
  else {
    return '';
  }
}

/*
  Define a function that returns, as a string, the result of an operation
  commitment (not an operator entry). An operation is committed when the
  state’s committed terms are a number and an operator (in that order)
  and an operator entry makes an uncommitted number eligible for commitment.
  If and uncommitted number is committed and it is a percentage, it is
  converted to its percentage of the committed number before the operation
  is performed.
  Precondition: There are 2 committed terms.
*/
var perform = function perform (state) {
  var oldOp = state.terms[1][1];
  var term0 = Number.parseFloat(state.terms[0][1].replace(/–/, '-'));
  var term1String = state.numString.replace(/^–/, '-').replace(/%$/, '');
  var term1 = Number.parseFloat(term1String) * (
    state.numString.endsWith('%') ? term0 : 1
  );
  var result;
  if (oldOp === '+') {
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
  return typeof result === 'number'
    ? standardize(result.toString().replace(/^-/, '–'))
    : '';
};

/*
  Define a function that responds to a binary operator entry. Make it the
  uncommitted operator. If there is an uncommitted number, there are 2
  committed terms, and the commitment of the uncommitted number would not
  cause a division by 0, also perform the already-committed operation on
  the committed number and the uncommitted one and commit the result. If
  there is an uncommitted number and no committed term, commit the uncommitted
  number.
  Preconditions:
    0. op is a binary operator.
    1. There is at least 1 committed term.
*/
var takeOp = function takeOp(state, op) {
  state.op = op;
  if (
    state.numString
    && state.terms.length
    && (
      state.terms[1] !== '/'
      || standardize(state.numString) !== '0'
    )
  ) {
    var result = perform(state);
    if (result.length) {
      state.terms.push(['num', standardize(result)]);
    }
  }
  else {
    state.terms.push(['num', standardize(state.numString)]);
  }
  state.numString = undefined;
};

/*
  Define a function that responds to a toggle operator entry if there is
  an uncommitted number.
*/
var takeToggle = function takeToggle(state, op) {
  if (state.numString) {
    if (op === '+/–') {
      state.numString = invert(state.numString);
    }
    else if (op === '%') {
      state.numString = pctToggle(state.numString);
    }
  }
};

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
    'Clear': '⌫',
    'Escape': ['⌫'],
    'Dead': '⌫',
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

exports.show = showState;
exports.takeDigit = takeDigit;
exports.takeOp = takeOp;
exports.takeToggle = takeToggle;
