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
  Define a function that returns a numeric string without a reciprocal or
  minus sign and without a scientific multiplicand, its scientific
  multiplicand if any, whether the string had a reciprocal sign, and whether
  the string had a minus sign.
*/
var baseNumString = function baseNumString(numString) {
  return [
    numString.replace(/^[⅟-]+|e.+$/g, ''),
    numString.replace(/^[^e]+/, ''),
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
  Define a function that returns a numeric string, with the entire string
  or, if in scientific notation, its multiplier rounded to 9 decimal
  digits if it has more than 9, to 1 fewer if it has 9 or fewer, or to an
  integer if it has 1 or it ends with a decimal point.
  Precondition: numString is valid (therefore also not blank).
*/
var round = function round(numString) {
  var parts = baseNumString(numString);
  var decimalMatch = parts[0].match(/\.(.*)/);
  if (
    decimalMatch
    && decimalMatch.length === 2
  ) {
    var newDecimalCount = Math.max(0, Math.min(decimalMatch[1].length - 1, 9));
    roundedBareNS
      = Number.parseFloat(parts[0] + parts[1]).toFixed(newDecimalCount);
    numString = unbare(roundedBareNS, parts[2], parts[3]);
  }
  return numString;
};

// Define a function that returns a button text that corresponds to a key text.
var keyToButton = function keyToButton(keyText) {
  var keyToButtonMap = {
    '/': 'op/',
    '7': 'num7',
    '8': 'num8',
    '9': 'num9',
    '`': 'op^',
    '*': 'op*',
    '4': 'num4',
    '5': 'num5',
    '6': 'num6',
    '\\': 'op1',
    '-': 'op-',
    '1': 'num1',
    '2': 'num2',
    '3': 'num3',
    'Clear': 'op!',
    'Escape': 'op!',
    'Dead': 'op!',
    'Backspace': 'op!',
    '+': 'op+',
    '0': 'num0',
    '.': 'num.',
    '=': 'op=',
    'Enter': 'op=',
    '~': 'op~'
  };
  return keyToButtonMap[keyText] || '';
};

// Define a function that returns a digit string that corresponds to an ID.
var digitButtonToShow = function digitButtonToShow(digitButtonSymbol) {
  var digitButtonToShowMap = {
    'num0': '0',
    'num1': '1',
    'num2': '2',
    'num3': '3',
    'num4': '4',
    'num5': '5',
    'num6': '6',
    'num7': '7',
    'num8': '8',
    'num9': '9',
    'num.': '.'
  };
  return digitButtonToShowMap[digitButtonSymbol] || '';
};

/*
  Define a function that returns a binary operator that corresponds to a
  button symbol.
*/
var binaryButtonToShow = function binaryButtonToShow(binaryOpSymbol) {
  var binaryButtonToShowMap = {
    'op/': '÷',
    'op*': '×',
    'op-': '–',
    'op+': '+'
  };
  return binaryButtonToShowMap[binaryOpSymbol] || '';
};

// Define a function that returns the HTML of a numeric string.
var numStringHTML = function numStringHTML(numString) {
  var recipHTML = '<span class="tight hi">1/</span>';
  return numString.replace(/⅟/g, recipHTML);
};

// /// CALCULATOR INTERROGATION /// //

// Define a function that returns the button imputable to the target of a click.
var imputedButton = function imputedButton(element) {
  var classList = element.className.split(' ');
  if (classList.includes('text')) {
    return element.id;
  }
  else if (classList.includes('calculator-button')) {
    return element.firstElementChild.id;
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
  var pureTerm0 = pureNumString(state.terms[0]);
  var term0Num = Number.parseFloat(pureTerm0[0]);
  var pureNS = pureNumString(state.numString);
  var term1Num = Number.parseFloat(pureNS[0]);
  if (pureTerm0[1]) {
    term0Num = 1 / term0Num;
  }
  if (pureNS[1]) {
    if (term1Num === 0) {
      return '';
    }
    else {
      term1Num = 1 / term1Num;
    }
  }
  var result;
  switch (oldOp) {
    case 'op/': result = term0Num / term1Num; break;
    case 'op*': result = term0Num * term1Num; break;
    case 'op-': result = term0Num - term1Num; break;
    case 'op+': result = term0Num + term1Num; break;
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
    state.terms.length === 2 && state.terms[1] === 'op/' || pureNS[1]
  );
};

// /// STATE MODIFICATION: ENTRY-TYPE-SPECIFIC /// //

/*
  Define a function that displays the main facts of the state in the
  calculator.
*/
var showMain = function showMain() {
  var state = session.getState();
  var showNumString = state.numString ? numStringHTML(state.numString) : '';
  var showTerm0 = state.terms[0] ? numStringHTML(state.terms[0]) : '';
  var mainHTML;
  if (!state.terms.length) {
    mainHTML = state.numString ? showNumString : '';
  }
  else if (state.terms.length === 1) {
    mainHTML = [showTerm0, binaryButtonToShow(state.op)].join(' ');
  }
  else {
    mainHTML = [
      showTerm0, binaryButtonToShow(state.terms[1]), showNumString
    ].join(' ');
  }
  var mainShowElement = document.getElementById('result');
  mainShowElement.innerHTML = mainHTML;
  var realLength = mainShowElement.textContent.length;
  var sizeSpec
    = (realLength > 11 ? Math.ceil(2475 / realLength): 225).toString() + '%';
  mainShowElement.style.fontSize = sizeSpec;
};

// Define a function that makes all and only eligible buttons responsive.
var setButtons = function setButtons(state) {
  var nonNumButtons = {
    'zero': ['std', true],
    'dot': ['std', true],
    'binary': ['op', true],
    'modifier': ['op', true],
    'delete': ['op', true],
    'equal': ['op', true],
    'round': ['op', true]
  };
  nonNumButtons.zero[1]
    = !state.numString || bareNumString(state.numString)[0] !== '0';
  nonNumButtons.dot[1] = !state.numString || !state.numString.includes('.');
  nonNumButtons.binary[1] = state.numString || state.terms.length;
  nonNumButtons.modifier[1] = state.numString;
  nonNumButtons.delete[1] = state.numString || state.op || state.terms.length;
  nonNumButtons.equal[1] = state.terms.length === 2 && state.numString;
  nonNumButtons.round[1] = state.numString
    && (state.terms.length === 2 || state.numString.includes('.'));
  for (var buttonType in nonNumButtons) {
    var typeButtons = document.getElementsByClassName('button-' + buttonType);
    for (var i = 0; i < typeButtons.length; i++) {
      if (nonNumButtons[buttonType][1]) {
        typeButtons.item(i).classList.remove('button-off');
        typeButtons.item(i).classList.add('button-on');
      }
      else {
        typeButtons.item(i).classList.remove('button-on');
        typeButtons.item(i).classList.add('button-off');
      }
    }
  }
};

/*
  Define a function that shows the result in the calculator, saves the
  state, and sets the buttons’ responsivenesses.
*/
var finish = function finish(state) {
  session.setState(state);
  showMain();
  setButtons(state);
};

/*
  Define a function that responds to a toggle operator entry.
*/
var takeToggle = function takeToggle(opSymbol) {
  var state = session.getState();
  if (state.numString) {
    if (opSymbol === 'op^') {
      state.numString = invert(state.numString);
    }
    else if (opSymbol === 'op1') {
      state.numString = recipToggle(state.numString);
    }
    else {
      return;
    }
    finish(state);
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
var takeDigit = function takeDigit(digitSymbol) {
  var state = session.getState();
  var numString = state.numString;
  var digitString = digitButtonToShow(digitSymbol);
  var numStringStart = digitSymbol === 'num.' ? '0.' : digitString;
  if (state.op) {
    state.numString = numStringStart;
    state.terms.push(state.op);
    state.op = undefined;
  }
  else if (numString) {
    if (digitSymbol === 'num.') {
      if (numString.includes('.')) {
        return;
      }
      else {
        state.numString += digitString;
      }
    }
    else if (digitSymbol === 'num0') {
      if (pureNumString(numString)[0] === '0') {
        return;
      }
      else {
        state.numString += digitString;
      }
    }
    else {
      state.numString = standardize(state.numString + digitString, false);
    }
  }
  else {
    state.numString = numStringStart;
  }
  finish(state);
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
    0. symbol is a binary-key symbol.
*/
var takeBinary = function takeBinary(symbol) {
  var state = session.getState();
  if (state.numString) {
    if (!divBy0()) {
      if (state.terms.length) {
        var result = perform();
        if (result.length) {
          state.terms = [standardize(result, true)];
          state.numString = undefined;
          state.op = symbol;
        }
      }
      else {
        state.terms = [standardize(state.numString, true)];
        state.numString = undefined;
        state.op = symbol;
      }
      finish(state);
    }
  }
  else if (state.op || state.terms.length) {
    state.op = symbol;
    finish(state);
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
  finish(state);
};

/*
  Define a function that responds to an equal operator entry. If there is
  a binary operation ready to perform, perform it, making the result the
  state’s uncommitted term and leaving the state with no committed term.
  Otherwise, do nothing.
*/
var takeEqual = function takeEqual() {
  var state = session.getState();
  if (state.numString && state.terms.length && !divBy0()) {
    var result = perform();
    if (result.length) {
      state.numString = standardize(result, true);
      state.terms = [];
      state.op = undefined;
      finish(state);
    }
  }
};

/*
  Define a function that responds to a rounding operator entry. If there is
  a binary operation ready to perform, perform it, rounding the result to
  9 decimal digits if it would otherwise be longer, making it the state’s
  uncommitted term, and leaving the state with no committed term. If there
  is an uncommitted numeric string, there is no committed term, and the
  string has any decimal digits, round the string to 1 fewer decimal digit.
  Otherwise, do nothing.
*/
var takeRound = function takeRound() {
  var state = session.getState();
  if (state.numString && state.terms.length && !divBy0()) {
    var roundedResult = round(perform());
    if (roundedResult.length) {
      state.numString = standardize(roundedResult, true);
      state.terms = [];
      state.op = undefined;
      finish(state);
    }
  }
  else if (state.numString && state.terms.length === 0) {
    state.numString = round(state.numString);
    finish(state);
  }
};

// /// STATE MODIFICATION: GENERAL /// //

// Define a function that responds to a button or key input.
var inputRespond = function inputRespond(symbol) {
  if (digitButtonToShow(symbol)) {
    takeDigit(symbol);
  }
  else if (binaryButtonToShow(symbol)) {
    takeBinary(symbol);
  }
  else if (['op^', 'op1'].includes(symbol)) {
    takeToggle(symbol);
  }
  else if (symbol === 'op!') {
    takeDel(symbol);
  }
  else if (symbol === 'op=') {
    takeEqual(symbol);
  }
  else if (symbol === 'op~') {
    takeRound(symbol);
  }
};

// Define a function that responds to a button click.
var clickRespond = function clickRespond(event) {
  inputRespond(imputedButton(event.target));
};

// Define a function that responds to a keyboard keypress.
var keyRespond = function keyRespond(event) {
  inputRespond(keyToButton(event.key));
};

// /// EXECUTION /// //

// Event listeners
document.getElementById('buttons0').addEventListener('click', clickRespond);
window.addEventListener('keydown', keyRespond);
