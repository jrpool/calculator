// /// STRING MANIPULATION /// //

/*
  Define a function that returns a numeric string without a percent sign
  and whether the string had a percent sign.
*/
var pureNumString = function pureNumString(numString) {
  return [numString.replace(/%$/, ''), numString.endsWith('%')];
};

/*
  Define a function that returns a numeric string without a minus sign or
  percent sign, and whether the string had a minus sign, and whether the
  string had a percent sign.
*/
var bareNumString = function bareNumString(numString) {
  return [
    numString.replace(/^-|%$/g, ''),
    numString.startsWith('-'),
    numString.endsWith('%')
  ];
};

/*
  Define a function that converts a bare-string array returned by
  bareNumString into a complete numeric string and returns it.
*/
var unbare = function unbare(bareString, hadMinus, hadPct) {
  return (hadMinus ? '-' : '') + bareString + (hadPct ? '%' : '');
};

/*
  Define a function that returns a standardized numeric string. If the string
  is to be committed, standardize it fully ((1) leading “0”s deleted before
  final whole-number 0 or any other whole-number digit, (2) leading “.”
  prepended with “0”, (3) post-“.” trailing “0”s deleted, (4) trailing “.”
  deleted). If the string is not to be committed, measures 1 and 2 only,
  since trailing “.” and/or post-“.” “0”s will later become valid if more
  digits are appended.
  Precondition: numString is not blank.
*/
var standardize = function standardize(numString, commit) {
  var bareNS = bareNumString(numString);
  var bareParts = bareNS[0].split('.');
  if (bareParts[0] === '') {
    bareParts[0] = '0';
  }
  else if (bareParts[0].endsWith('0')) {
    bareParts[0] = bareParts[0].replace(/^0{2,}/, '0');
  }
  else {
    bareParts[0] = bareParts[0].replace(/^0+/, '');
  }
  if (commit && bareParts.length === 2) {
    bareParts[1] = bareParts[1].replace(/0+$/, '');
    if (bareParts[1] === '') {
      bareParts.splice(1);
    }
  }
  bareNS[0] = bareParts.join('.');
  return unbare(...bareNS);
};

// Define a function that inverts the sign of a numeric string.
var invert = function invert(numString) {
  if (numString.length) {
    return numString[0] === '-' ? numString.slice(1) : '-' + numString;
  }
  else {
    return '';
  }
};

/*
  Define a function that returns a numeric string with the presence of a
  percent sign on it toggled.
*/
var pctToggle = function pctToggle(numString) {
  if (numString.length) {
    var pureNS = pureNumString(numString);
    return pureNS[1] ? pureNS[0] : numString + '%';
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
    if (bareNS[0].endsWith('.')) {
      bareNS[0] = bareNS[0].slice(0, -1);
    }
    if (bareNS[0] === '0' && bareNS[1]) {
      bareNS[1] = false;
    }
    return unbare(...bareNS);
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
    terms: []
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
  var term0 = Number.parseFloat(state.terms[0]);
  var pureNS = pureNumString(state.numString);
  var term1
    = Number.parseFloat(pureNS[0]) * (pureNS[1] ? term0 / 100 : 1);
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
    else if (op === '%' && state.terms.length) {
      state.numString = pctToggle(state.numString);
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
  it, append it. If there is no committed or uncommitted term, initialize
  an uncommitted numeric string. Digits are defined as “0”–“9” and “.”.
*/
var takeDigit = function takeDigit(digit) {
  var state = session.getState();
  if (state.op) {
    state.numString = digit;
    state.terms.push(state.op);
    state.op = undefined;
  }
  else if (state.numString) {
    var bareNS = bareNumString(state.numString);
    if (bareNS[0] === '0' && digit === '0') {
      return;
    }
    else {
      bareNS[0] += digit;
      state.numString = standardize(unbare(...bareNS), false);
    }
  }
  else if (!state.terms.length) {
    state.numString = digit === '.' ? '0.' : digit;
  }
  else {
    return;
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
    if (state.terms.length) {
      if (
        state.terms[1] !== '/' || standardize(state.numString, true) !== '0'
      ) {
        var result = perform();
        if (result.length) {
          state.terms = [standardize(result, true)];
          state.numString = undefined;
          state.op = op;
        }
      }
    }
    else {
      state.terms = [standardize(state.numString, true)];
      state.numString = undefined;
      state.op = op;
    }
  }
  session.setState(state);
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
      state.numString = newString;
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
    state.numString = truncate(state.terms.pop());
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
  if (
    state.numString
    && state.terms.length
    && (state.terms[1] !== '/' || standardize(state.numString, true) !== '0')
  ) {
    var result = perform();
    if (result.length) {
      state.terms.push(standardize(result, true));
      state.numString = undefined;
    }
    session.setState(state);
  }
};

// /// STATE MODIFICATION: GENERAL /// //

/*
  Define a function that trims the terms of the state and displays the
  state in the calculator.
*/
var show = function show() {
  var state = session.getState();
  var termString = Object.values(state.terms).join(' ');
  var pendingString = state.op || state.numString || '';
  var showableString = (termString ? termString + ' ' : '') + pendingString;
  var resultElement = document.getElementById('result');
  resultElement.innerText = showableString;
  var sizeSpec = (
    showableString.length > 8 ? Math.ceil(1800 / showableString.length) : 225
  ).toString() + '%';
  resultElement.style.fontSize = sizeSpec;
};

// Define a function that responds to a button or key input.
var inputRespond = function inputRespond(symbol) {
  if (/^[0-9.]$/.test(symbol)) {
    takeDigit(symbol);
  }
  else if (['÷', '×', '–', '+'].includes(symbol)) {
    takeBinary(symbol);
  }
  else if (['+/-', '%'].includes(symbol)) {
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
