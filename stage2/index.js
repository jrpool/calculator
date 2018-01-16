// /// STRING MANIPULATION /// //

/*
  With a “digit” being a character matching /[0-9.]/ and a numeric string
  consisting of optional prefixes (“–”, “⅟”, or “–⅟”), a multiplier (digits),
  and an optional multiplicand (“e” followed by digits), define a function
  that returns, for a numeric string:
    (0) its multiplier
    (1) its multiplicand
    (2) whether the string has a reciprocal prefix (“⅟”)
    (3) whether the string has a negation prefix (“–”)
  E.g., for '–⅟123.45e12' return ['123.45', 'e12', true, true].
*/
var parse = function(numString) {
  return [
    numString.replace(/^[⅟-]+|e.+$/g, ''),
    numString.replace(/^[^e]+/, ''),
    numString.startsWith('⅟'),
    numString.includes('-')
  ];
};

/*
  Define a function that returns the numeric string from which a parsing
  resulted.
*/
var unparse = function(parsed) {
  return (parsed[2] ? '⅟' : '')
    + (parsed[3] ? '-' : '')
    + parsed[0]
    + parsed[1];
};

/*
  Define a function that returns a standardized or semistandardized
  numeric string, depending on whether the string is or is not to be committed,
  respectively.
    Semistandardization is:
      0. If the string starts with “0” and a digit follows it, delete the “0”.
      1. If the string starts with “.”, prepend “0” to it.
    Standardization is semistandardization plus:
      2. Delete post-“.” trailing “0”s of the multiplier.
      3. Convert any “-0” of the multiplier to “0”.
      4. Delete any trailing “.” of the multiplier.
      5. Perform any reciprocal operation on the number.
  Preconditions:
    0. numString is not blank.
    1. numString is valid.
*/
var clean = function(numString, commit) {
  var parsed = parse(numString);
  var dotParsed = parsed[0].split('.');
  // 0
  dotParsed[0] = dotParsed[0].replace(/^0+(?=\d)/, '');
  // 1
  if (!dotParsed[0].length) {
    dotParsed[0] = '0';
  }
  if (!commit) {
    parsed[0] = dotParsed.join('.');
  }
  else {
    if (dotParsed.length === 1) {
      dotParsed.push('');
    }
    // 2
    dotParsed[1] = dotParsed[1].replace(/0+$/, '');
    // 3
    parsed[0] = parsed[0].replace(/^-0/, '0');
    // 4
    parsed[0] = dotParsed[0] + (dotParsed[1].length ? '.' + dotParsed[1] : '');
    // 5
    if (parsed[2]) {
      parsed[0] = (1 / Number.parseFloat(parsed[0] + parsed[1])).toString();
      parsed[2] = false;
    }
  }
  return unparse(parsed);
};

/*
  Define a function that returns a numeric string with the specified prefix
  toggled. Precondition: numString is valid.
*/
var toggledOf = function(numString, prefix) {
  var parsed = parse(numString);
  var prefixIndex = 2 + ['reciprocal', 'minus'].indexOf(prefix);
  parsed[prefixIndex] = !parsed[prefixIndex];
  return unparse(parsed);
};

/*
  Define a function that returns a numeric string with the last digit of its
  multiplier removed and, if the removal leaves it empty, with its prefixes
  deleted. Precondition: numString contains at least 1 digit.
*/
var digitPop = function(numString) {
  var parsed = parse(numString);
  if (parsed[0].length === 1) {
    return '';
  }
  else {
    parsed[0] = parsed[0].slice(0, -1);
    return unparse(parsed);
  }
};

/*
  Define a function that returns a numeric string, standardized and with
  its multiplier rounded down by 1 decimal digit, subject to a maximum count
  of decimal digits. Precondition: numString is valid.
*/
var round = function(numString, decimalsMax) {
  var cleaned = clean(numString, true);
  var parsed = parse(cleaned);
  var dotIndex = parsed[0].indexOf('.');
  if (dotIndex > -1) {
    parsed[0] = Number.parseFloat(parsed[0])
      .toFixed(Math.min(decimalsMax, parsed[0].length - dotIndex -2));
  }
  return unparse(parsed);
};

/*
  Define a function that returns a button symbol that corresponds to a key
  text, or an empty string if none.
*/
var buttonOf = function(keyText) {
  var keyButtonMap = {
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
  return keyButtonMap[keyText] || '';
};

/*
  Define a function that returns a digit button’s symbol’s digit as a string.
*/
var digitOf = function(symbol) {
  return symbol.startsWith('num') ? symbol.slice(-1) : '';
};

/*
  Define a function that returns a binary button’s symbol’s operator.
*/
var opOf = function(symbol) {
  return '÷×–+'['/*-+'.indexOf(symbol.slice(-1))] || '';
};

// Define a function that returns the HTML of a numeric string.
var htmlOf = function(numString) {
  return numString.replace(/⅟/g, '<span class="tight hi">1/</span>');
};

/*
  Define a function that returns a numeric string with a digit appended to
  the multiplier. Precondition: symbol is a digit symbol.
*/
var digitPush = function(numString, symbol) {
  var parsed = parse(numString);
  parsed[0] += digitOf(symbol);
  return unparse(parsed);
};

// /// CALCULATOR INTERROGATION /// //

/*
  Define a function that returns the button imputable as the target of a click,
  or an empty string if none.
*/
var realTargetOf = function(element) {
  if (element.classList.contains('text')) {
    return element.id;
  }
  else if (element.classList.contains('button')) {
    return element.firstElementChild.id;
  }
  else {
    return '';
  }
};

// /// STATE INTERROGATION /// //

/*
  Define a local object representing the document’s state and global methods
  that get and set the state. Initialize the state’s properties:
    numString: the current uncommitted number as a string.
    op: the current uncommitted binary operator as a string.
    terms: the current result as an array of a committed number and a
      committed binary operator.
    contingentButtons: an object with properties describing the volatile
      buttons, each having as its value an array of the button class (“std”
      for gray or “op” for orange) and whether the button is now enabled.
*/
var session = (function() {
  var state = {
    numString: '',
    op: undefined,
    terms: [],
    contingentButtons: {
      'zero': ['std', true],
      'dot': ['std', true],
      'binary': ['op', false],
      'modifier': ['op', false],
      'delete': ['op', false],
      'equal': ['op', false],
      'round': ['op', false]
    }
  };
  return {
    getState: function() {return JSON.parse(JSON.stringify(state));},
    setState: function(newState) {state = JSON.parse(JSON.stringify(newState));}
  };
})();

/*
  Define a function that returns, as a string, the result of a binary
  operation on the committed terms and the uncommitted number.
*/
var perform = function(state) {
  var num0 = Number.parseFloat(clean(state.terms[0], true));
  var num1 = Number.parseFloat(clean(state.numString, true));
  var result;
  switch (state.terms[1]) {
    case 'op/': result = num0 / num1; break;
    case 'op*': result = num0 * num1; break;
    case 'op-': result = num0 - num1; break;
    case 'op+': result = num0 + num1; break;
  }
  return typeof result === 'number' ? result.toString() : '';
};

// /// STATE MODIFICATION: ENTRY-TYPE-SPECIFIC /// //

// Define a function that displays the state in the calculator.
var showState = function(state) {
  var views = [];
  views.push(state.terms[0] ? htmlOf(state.terms[0]) : '');
  views.push(state.terms[1] ? opOf(state.terms[1]) : '');
  views.push(state.numString ? htmlOf(state.numString) : '');
  views.push(state.op ? opOf(state.op) : '');
  var viewElement = document.getElementById('result');
  viewElement.innerHTML
    = views.filter(function(view) {return view.length;}).join(' ');
  var viewLength = viewElement.textContent.length;
  viewElement.style.fontSize
    = (viewLength > 11 ? Math.ceil(2475 / viewLength): 225).toString() + '%';
};

// Define a function that makes all and only eligible buttons responsive.
var setButtons = function(state) {
  state.contingentButtons.zero[1]
    = !state.numString || parse(state.numString)[0] !== '0';
  state.contingentButtons.dot[1]
    = !state.numString || !state.numString.includes('.');
  state.contingentButtons.binary[1] = state.numString || state.terms.length;
  state.contingentButtons.modifier[1] = state.numString;
  state.contingentButtons.delete[1]
    = state.numString || state.op || state.terms.length;
  state.contingentButtons.equal[1] = state.terms.length && state.numString;
  state.contingentButtons.round[1]
    = state.numString && (state.terms.length || state.numString.includes('.'));
  session.setState(state);
  for (var buttonType in state.contingentButtons) {
    var typeButtons = document.getElementsByClassName('button-' + buttonType);
    for (var i = 0; i < typeButtons.length; i++) {
      if (state.contingentButtons[buttonType][1]) {
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
  Define a function that shows the state in the calculator, saves the state,
  and sets the buttons’ responsivenesses.
*/
var finish = function(state) {
  session.setState(state);
  showState(state);
  setButtons(state);
};

/*
  Define a function that modifies the state in accord with the result of
  a binary operation.
*/
var finishResult = function(state, result) {
  if (result.length) {
    state.numString = clean(result, true);
    state.terms = [];
    state.op = undefined;
    finish(state);
  }
};

/*
  Define a function that responds to a modifier entry. Preconditions:
    0. The symbol is a modifier symbol.
    1. There is a valid numString.
*/
var takeModifier = function(state, symbol) {
  if (state.contingentButtons.modifier[1]) {
    state.numString = toggledOf(state.numString, {
      'op^': 'minus',
      'op1': 'reciprocal'
    }[symbol]);
    finish(state);
  }
};

// Define a function that responds to a digit (“0”–“9” or “.”) entry.
var takeDigit = function(state, symbol) {
  if (
    (symbol !== 'num.' || state.contingentButtons.dot[1])
    && (symbol !== 'num0' || state.contingentButtons.zero[1])
  ) {
    if (state.numString) {
      state.numString = clean(digitPush(state.numString, symbol), false);
    }
    else {
      state.numString = clean(digitOf(symbol), false);
      if (state.op) {
        state.terms.push(state.op);
        state.op = undefined;
      }
    }
    finish(state);
  }
};

/*
  Define a function that responds to a binary operator entry. Replace any
  uncommitted binary operator with it. If there is an uncommitted number and
  any terms, perform their operation and replace the terms with the result.
  If there are no committed terms but there is an uncommitted number, commit
  it. Precondition: symbol is a binary operator symbol.
*/
var takeBinary = function(state, symbol) {
  if (state.contingentButtons.binary[1]) {
    if (state.numString) {
      if (state.terms.length) {
        var result = perform(state);
        if (result.length) {
          state.terms = [clean(result, true)];
          state.numString = undefined;
          state.op = symbol;
        }
      }
      else {
        state.terms = [clean(state.numString, true)];
        state.numString = undefined;
        state.op = symbol;
      }
      finish(state);
    }
    else if (state.op) {
      state.op = symbol;
      finish(state);
    }
  }
};

/*
  Define a function that responds to a deletion operator entry. If there is
  an uncommitted number, delete its multiplier’s last character. If there is
  an uncommitted binary operator, delete it. If the deletion deletes the
  uncommitted term and there is a committed term, uncommit it.
*/
var takeDel = function(state) {
  if (state.contingentButtons.delete[1]) {
    if (state.numString) {
      state.numString = digitPop(state.numString);
      if (!state.numString.length) {
        state.numString = undefined;
        if (state.terms.length) {
          state.op = state.terms.pop();
        }
      }
      finish(state);
    }
    else if (state.op) {
      state.op = undefined;
      state.numString = state.terms.pop();
      finish(state);
    }
  }
};

/*
  Define a function that responds to an equal operator entry. Perform the binary operation specified by the terms and uncommitted number and make
  the result the state’s uncommitted term, leaving the state with no
  committed term. Precondition: There are 2 terms and an uncommitted number.
*/
var takeEqual = function(state) {
  if (state.contingentButtons.equal[1]) {
    finishResult(state, perform(state));
  }
};

/*
  Define a function that responds to a rounding operator entry. If there is
  a binary operation ready to perform, perform it, rounding the result to
  9 decimal digits if it would otherwise be longer, making it the state’s
  uncommitted term, and leaving the state with no committed term. If there
  is an uncommitted numeric string, there is no committed term, and the
  string has any decimal digits, round the string to 1 fewer decimal digit.
*/
var takeRound = function(state) {
  if (state.contingentButtons.round[1]) {
    if (state.numString) {
      if (state.terms.length) {
        finishResult(state, round(perform(state), 9));
      }
      else {
        state.numString = round(state.numString, 99);
        finish(state);
      }
    }
  }
};

// /// STATE MODIFICATION: GENERAL /// //

// Define a utility for the event handlers.
var inputRespond = function(symbol) {
  var state = session.getState();
  if (digitOf(symbol)) {
    takeDigit(state, symbol);
  }
  else if (opOf(symbol)) {
    takeBinary(state, symbol);
  }
  else if (['op^', 'op1'].includes(symbol)) {
    takeModifier(state, symbol);
  }
  else if (symbol === 'op!') {
    takeDel(state);
  }
  else if (symbol === 'op=') {
    takeEqual(state);
  }
  else if (symbol === 'op~') {
    takeRound(state);
  }
};

// Define an event handler for a mouse click.
var clickRespond = function(event) {
  inputRespond(realTargetOf(event.target));
};

// Define an event handler for a keyboard keypress.
var keyRespond = function(event) {
  var symbol = buttonOf(event.key);
  if (symbol) {
    inputRespond(symbol);
  }
};

// /// EXECUTION /// //

// Create event listeners
document.getElementById('buttons').addEventListener('click', clickRespond);
window.addEventListener('keydown', keyRespond);
