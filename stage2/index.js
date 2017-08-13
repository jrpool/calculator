// /// STRING MANIPULATION /// //

/*
  Define a function that returns a numeric string without a reciprocal sign
  and whether the string had a reciprocal sign.
*/
var pureNumString = function pureNumString(numString) {
  return [numString.replace(/^⅟/, ''), numString.startsWith('⅟')];
};

/*
  Define a function that returns a numeric string without a reciprocal or
  minus sign, whether the string had a reciprocal sign, and whether the
  string had a minus sign.
*/
var bareNumString = function bareNumString(numString) {
  return [
    numString.replace(/^[⅟-]+/, ''),
    numString.startsWith('⅟'),
    numString.includes('-')
  ];
};

/*
  Define a function that converts a bare-string array returned by
  bareNumString into a complete numeric string and returns it.
*/
var unbare = function unbare(bareString, hadRecip, hadMinus) {
  return (hadRecip ? '⅟' : '') + (hadMinus ? '-' : '') + bareString;
};

/*
  Define a function that returns a standardized numeric string. If the string
  is to be committed, standardize it fully ((1) leading “0”s deleted before
  final whole-number 0 or any other whole-number digit, (2) leading “.”
  prepended with “0”, (3) post-“.” trailing “0”s deleted, (4) trailing “.”
  deleted, (5) “-0” converted to “0”). If the string is not to be committed,
  measures 1 and 2 only, since other invalidities may later disappear if
  more digits are appended.
  Preconditions:
    0. numString is not blank.
    1. numString does not have a reciprocal sign.
*/
var standardize = function standardize(numString, commit) {
  var bareNS = bareNumString(numString);
  var bareParts = bareNS[0].split('.');
  // Standardize leading “0”s.
  if (bareParts.length === 2 && bareParts[0] === '') {
    bareParts[0] = '0';
  }
  else if (bareParts[0].endsWith('0')) {
    bareParts[0] = bareParts[0].replace(/^0{2,}/, '0');
  }
  else {
    bareParts[0] = bareParts[0].replace(/^0+/, '');
  }
  // Delete trailing decimal “0”s.
  if (commit && bareParts.length === 2) {
    bareParts[1] = bareParts[1].replace(/0+$/, '');
    if (bareParts[1] === '') {
      bareParts.splice(1);
    }
  }
  // Convert “-0” to “0”.
  if (commit && bareParts[0] === '0' && bareNS[2]) {
    bareNS[2] = false;
  }
  bareNS[0] = bareParts.join('.');
  return unbare(...bareNS);
};

// Define a function that inverts the sign of a numeric string.
var invert = function invert(numString) {
  if (numString.length) {
    return numString.includes('-')
      ? numString.replace(/-/, '')
      : (
        numString.startsWith('⅟')
          ? numString.replace(/^⅟/, '⅟-')
          : '-' + numString
      );
  }
  else {
    return '';
  }
};

/*
  Define a function that returns a numeric string with the presence of a
  reciprocal sign on it toggled.
*/
var recipToggle = function recipToggle(numString) {
  if (numString.length) {
    var pureNS = pureNumString(numString);
    return pureNS[1] ? pureNS[0] : '⅟' + numString;
  }
  else {
    return '';
  }
};

/*
  Define a function that returns a numeric string with its last digit
  (“0”–“9” or “.”) truncated.
  Precondition: numString contains at least 1 digit.
*/
var truncate = function truncate(numString) {
  var bareNS = bareNumString(numString);
  if (bareNS[0].length === 1) {
    return '';
  }
  else {
    bareNS[0] = bareNS[0].slice(0, -1);
    if (bareNS[0] === '0' && bareNS[2]) {
      bareNS[2] = false;
    }
    return unbare(...bareNS);
  }
};

/*
  Define a function that returns a numeric string shortened to impose a
  specified limit on the count of its decimal digits.
*/
var shorten = function shorten(numString, precision) {
  var dotIndex = numString.indexOf('.');
  var decimalLength = numString.length - dotIndex;
  if (dotIndex === -1 || decimalLength < 4 || decimalLength < precision) {
    return numString;
  }
  else {
    return numString.slice(0, dotIndex + precision) + '…';
  }
};

// Define a function that returns a button text that corresponds to a key text.
var keyToButton = function keyToButton(keyText) {
  var keyToButtonMap = {
    'Clear': '⌫',
    'Escape': '⌫',
    'Dead': '⌫',
    'Backspace': '⌫',
    'Enter': '=',
    '~': '+/-',
    '\\': '⅟',
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
  return keyToButtonMap[keyText] || '';
};

// /// CALCULATOR INTERROGATION /// //

// Define a function that returns the text imputable to the target of a click.
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

// /// STATE INTERROGATION /// //

/*
  Define a function that returns a function that gets and sets the
  document’s state.
*/
var session = (function() {
  var state = {
    numString: '',
    op: undefined,
    terms: [],
    precision: 3
  };
  return {
    getState: function() {return JSON.parse(JSON.stringify(state));},
    setState: function(newState) {state = JSON.parse(JSON.stringify(newState));}
  };
})();

/*
  Define a function that returns, as a string, the result of a binary operation
  commitment (not an operator entry). A binary operation is committed when the
  state’s committed terms are a number and a bi]nary operator (in that order)
  and a binary operator entry makes an uncommitted number eligible for
  commitment. If an uncommitted number is committed and it is a percentage,
  it is converted to its percentage of the committed number before the
  operation is performed.
  Precondition: There are 2 committed terms and an uncommitted numeric string.
*/
var perform = function perform() {
  var state = session.getState();
  var oldOp = state.terms[1];
  var pureS0 = pureNumString(state.terms[0]);
  var term0 = Number.parseFloat(pureS0[0]);
  var pureNS = pureNumString(state.numString);
  var term1 = Number.parseFloat(pureNS[0]);
  if (pureS0[1]) {
    term0 = 1 / term0;
  }
  if (pureNS[1]) {
    if (term1 === 0) {
      return '';
    }
    else {
      term1 = 1 / term1;
    }
  }
  var result;
  if (oldOp === '+') {
    result = term0 + term1;
  }
  else if (oldOp === '–') {
    result = term0 - term1;
  }
  else if (oldOp === '×') {
    result = term0 * term1;
  }
  // Precondition: divisor is not 0.
  else if (oldOp === '÷') {
    result = term0 / term1;
  }
  return typeof result === 'number' ? standardize(result.toString(), true) : '';
};

/*
  Define a function that returns whether a binary operation commitment would
  include a division by 0.], either because the operation is division or
  because the uncommitted number has a reciprocal sign.
  Preconditions:
    0. state.numString exists.
*/
var divBy0 = function divBy0() {
  var state = session.getState();
  var pureNS = pureNumString(state.numString);
  return standardize(pureNS[0], true) === '0' && (
    state.terms.length === 2 && state.terms[1] === '÷' || pureNS[1]
  );
};

// /// STATE MODIFICATION: ENTRY-TYPE-SPECIFIC /// //

/*
  Define a function that responds to a toggle operator entry.
*/
var takeToggle = function takeToggle(op) {
  var state = session.getState();
  if (state.numString) {
    if (op === '+/-') {
      state.numString = invert(state.numString);
    }
    else if (op === '⅟') {
      state.numString = recipToggle(state.numString);
    }
    else {
      return;
    }
    session.setState(state);
  }
};

/*
  Define a function that responds to a digit entry. If there is an uncommitted
  operator, commit it and initialize an uncommitted numeric string. If there
  is an uncommitted numeric string and the digit can validly be appended to
  it, append it, replacing a leading “0” if necessary. If there is no
  committed or uncommitted term, initialize an uncommitted numeric string.
  Digits are defined as “0”–“9” and “.”.
*/
var takeDigit = function takeDigit(digit) {
  var state = session.getState();
  var numString = state.numString;
  if (state.op) {
    state.numString = digit === '.' ? '0.' : digit;
    state.terms.push(state.op);
    state.op = undefined;
  }
  else if (numString) {
    if (digit === '.') {
      if (numString.includes('.')) {
        return;
      }
      else {
        state.numString += '.';
      }
    }
    else if (digit === '0') {
      if (standardize(pureNumString(numString)[0], true) === '0') {
        return;
      }
      else {
        state.numString += '0';
      }
    }
    else {
      state.numString = standardize(state.numString + digit, false);
    }
  }
  else {
    state.numString = digit === '.' ? '0.' : digit;
  }
  session.setState(state);
};

/*
  Define a function that responds to a binary operator entry. Replace any
  uncommitted binary operator with it. If there are already committed terms
  and the committed binary operation could be performed on the committed and
  the uncommitted numbers (i.e. not division by 0), perform it and commit
  the result. If there are no committed terms but there is an uncommitted
  number, commit it. (By implication, if there is no uncommitted binary
  operator or number, do nothing.)
  Preconditions:
    0. op is a binary operator.
    1. There is at least 1 committed term.
*/
var takeBinary = function takeBinary(op) {
  var state = session.getState();
  if (state.numString) {
    if (!divBy0()) {
      if (state.terms.length) {
        var result = perform();
        if (result.length) {
          state.terms = [standardize(result, true)];
          state.numString = undefined;
          state.op = op;
        }
      }
      else {
        state.terms = [standardize(state.numString, true)];
        state.numString = undefined;
        state.op = op;
      }
      session.setState(state);
    }
  }
  else if (state.op || state.terms.length) {
    state.op = op;
    session.setState(state);
  }
};

/*
  Define a function that responds to a deletion operator entry. If there is
  an uncommitted term, delete its last character, except for any toggle
  character in a numeric string, and, if that deletion deletes the term
  and there is a committed term, uncommit the last committed term. If there
  is no uncommitted term and there is a committed term, uncommit and
  truncate the last committed term. If there is no term, do nothing.
*/
var takeDel = function takeDel() {
  var state = session.getState();
  if (state.numString) {
    var newString = truncate(state.numString);
    if (newString.length) {
      state.numString = standardize(newString, false);
    }
    else {
      state.numString = undefined;
      if (state.terms.length) {
        state.op = state.terms.pop();
      }
    }
  }
  else if (state.op) {
    state.op = undefined;
    state.numString = state.terms.pop();
  }
  else if (state.terms.length) {
    state.numString = standardize(truncate(state.terms.pop(), false));
  }
  else {
    return;
  }
  session.setState(state);
};

/*
  Define a function that responds to an equal operator entry. If there is
  a binary operation ready to perform, perform it, making the result the
  state’s sole committed term and leaving the state with no uncommitted
  numeric string or operator. Otherwise, do nothing.
*/
var takeEqual = function takeEqual() {
  var state = session.getState();
  if (state.numString && state.terms.length && !divBy0()) {
    var result = perform();
    if (result.length) {
      state.numString = standardize(result, true);
      state.terms = [];
      state.op = undefined;
      session.setState(state);
    }
  }
};

// /// STATE MODIFICATION: GENERAL /// //

// Define a function that displays the state in the calculator.
var show = function show() {
  var state = session.getState();
  var precision = state.precision;
  console.log('precision is ' + precision);
  var termString = state.terms.map(
    function(value) {return shorten(value, precision);}
  ).join(' ');
  console.log('termString is ' + termString);
  var pendingString = state.op || shorten(state.numString, precision) || '';
  console.log('pendingString is ' + pendingString);
  var properString = (termString ? termString + ' ' : '') + pendingString;
  var showableString
    = properString.replace(/⅟/g, '<span class="tight hi">1/</span>');
  var resultElement = document.getElementById('result');
  resultElement.innerHTML = showableString;
  var sizeSpec = (
    properString.length > 8 ? Math.ceil(1800 / properString.length) : 225
  ).toString() + '%';
  resultElement.style.fontSize = sizeSpec;
};

// Define a function that responds to a button or key input.
var inputRespond = function inputRespond(symbol) {
  var state = session.getState();
  if (
    /^[0-9.]$/.test(symbol)
    && state.numString
    && state.numString.length > state.precision
  ) {
    state.precision = Math.max(3, state.numString.length);
  }
  session.setState(state);
  if (/^[0-9.⌫]$/.test(symbol)) {
    takeDigit(symbol);
  }
  else if (['÷', '×', '–', '+'].includes(symbol)) {
    takeBinary(symbol);
  }
  else if (['+/-', '⅟'].includes(symbol)) {
    takeToggle(symbol);
  }
  else if (symbol === '⌫') {
    takeDel(symbol);
  }
  else if (symbol === '=') {
    takeEqual(symbol);
  }
  else {
    return;
  }
  show();
};

// Define a function that responds to a button click.
var clickRespond = function clickRespond(event) {
  inputRespond(imputedText(event.target));
};

// Define a function that responds to a keyboard keypress.
var keyRespond = function keyRespond(event) {
  inputRespond(keyToButton(event.key));
};

// /// EXECUTION /// //

// Event listeners
document.getElementById('buttons0').addEventListener('click', clickRespond);
window.addEventListener('keydown', keyRespond);
