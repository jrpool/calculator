// /// DEFINITIONS /// //

/*
  numChar: a character matching /[0-9.]/.
  Negative prefix: “–”.
  Reciprocal prefix: “⅟”.
  numString: a string that concatenates 4 segments:
    negative prefix (optional).
    reciprocal prefix (optional).
    multiplier: 1 or more numChars.
    multiplicand (optional): “e” followed by 1 or more numChars.
  cleanNumString: a numString whose multiplier does not begin with '0'
    immediately followed by another digit and does not begin with “.”
  finalNumString: a cleanNumString that has:
    1. No reciprocal prefix.
    2. No multiplier starting with “-0”.
    3. No post-“.” trailing “0”s in the multiplier.
    4. No trailing “.” in the multiplier.
  code: a unique identifier of a button.
  state: an object representing the information eligible for manipulation,
    containing 4 properties:
      currentNum: a numString being composed.
      op: the code of a binary operator .
      terms: the current result as an array of a committed numString and a
        committed binary operator code.
      contingentButtons: an object with properties describing the volatile
        buttons, each having as its value an array of the button class (“std”
        for gray or “op” for orange) and whether the button is now enabled.
  stateString: a string
  opChar: the character representing a binary operator in
*/

// /// STRING MANIPULATION /// //

/*
  Define a function that returns, for a numString:
    (0) its multiplier
    (1) its multiplicand
    (2) whether it has a reciprocal prefix (“⅟”)
    (3) whether it has a negation prefix (“–”)
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

// Define a function that returns the numString from which a parsing resulted.
var unparse = function(parsed) {
  return (parsed[2] ? '⅟' : '')
    + (parsed[3] ? '-' : '')
    + parsed[0]
    + parsed[1];
};

/*
  Define a function that converts a numString to a cleanNumString or a
  finalNumString. Preconditions:
    0. numString is not blank.
    1. numString is valid.
*/
var clean = function(numString, toFinal) {
  var parsed = parse(numString);
  var dotParsed = parsed[0].split('.');
  dotParsed[0] = dotParsed[0].replace(/^0+(?=\d)/, '');
  if (!dotParsed[0].length) {
    dotParsed[0] = '0';
  }
  if (!toFinal) {
    parsed[0] = dotParsed.join('.');
  }
  else {
    if (dotParsed.length === 1) {
      dotParsed.push('');
    }
    dotParsed[1] = dotParsed[1].replace(/0+$/, '');
    parsed[0] = parsed[0].replace(/^-0/, '0');
    parsed[0] = dotParsed[0] + (dotParsed[1].length ? '.' + dotParsed[1] : '');
    if (parsed[2]) {
      parsed[0] = (1 / Number.parseFloat(parsed[0] + parsed[1])).toString();
      parsed[2] = false;
    }
  }
  return unparse(parsed);
};

/*
  Define a function that returns a numString with the specified prefix toggled.
  Precondition: numString is valid.
*/
var toggledOf = function(numString, prefix) {
  var parsed = parse(numString);
  var prefixIndex = 2 + ['reciprocal', 'minus'].indexOf(prefix);
  parsed[prefixIndex] = !parsed[prefixIndex];
  return unparse(parsed);
};

/*
  Define a function that returns a numString with the last numChar of its
  multiplier removed and, if the removal leaves it empty, with its prefixes
  deleted. Precondition: numString contains at least 1 numChar.
*/
var numCharPop = function(numString) {
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
  Define a function that returns a numString, standardized and with its
  multiplier rounded down by 1 decimal digit, subject to a maximum count of
  decimal digits. Precondition: numString is valid.
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
  Define a function that returns a button code that corresponds to a key
  text, or an empty string if none.
*/
var buttonOf = function(keyText) {
  var keyButtonMap = {
    '÷': 'op/',
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
  Define a function that returns a numChar button’s code’s numChar as a string.
*/
var numCharOf = function(code) {
  return code.startsWith('num') ? code.slice(-1) : '';
};

/*
  Define a function that returns a binary button’s code’s 1-character symbol.
*/
var opCharOf = function(code) {
  return '÷×–+'['/*-+'.indexOf(code.slice(-1))] || '';
};

// Define a function that returns the HTML of a numString.
var htmlOf = function(numString) {
  return numString.replace(/⅟/g, '<span class="tight hi">1/</span>');
};

/*
  Define a function that returns a numString with a numChar appended to the
  multiplier. Precondition: code is a numChar code.
*/
var numCharPush = function(numString, code) {
  var parsed = parse(numString);
  parsed[0] += numCharOf(code);
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
*/
var session = (function() {
  var state = {
    numString: '',
    op: undefined,
    terms: [],
    contingentButtons: {
      'zero': ['std', true],
      'dot': ['std', true],
      'plus': ['op', false],
      'minus': ['op', false],
      'times': ['op', false],
      'over': ['op', false],
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
  views.push(state.terms[1] ? opCharOf(state.terms[1]) : '');
  views.push(state.numString ? htmlOf(state.numString) : '');
  views.push(state.op ? opCharOf(state.op) : '');
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
  state.contingentButtons.plus[1]
    = Boolean(state.numString || (state.terms.length && state.op !== 'op+'));
  state.contingentButtons.minus[1]
    = Boolean(state.numString || (state.terms.length && state.op !== 'op-'));
  state.contingentButtons.times[1]
    = Boolean(state.numString || (state.terms.length && state.op !== 'op*'));
  state.contingentButtons.over[1]
    = Boolean(state.numString || (state.terms.length && state.op !== 'op/'));
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
    0. The code is a modifier code.
    1. There is a valid numString.
*/
var takeModifier = function(state, code) {
  if (state.contingentButtons.modifier[1]) {
    state.numString = toggledOf(state.numString, {
      'op^': 'minus',
      'op1': 'reciprocal'
    }[code]);
    finish(state);
  }
};

// Define a function that responds to a numChar (“0”–“9” or “.”) entry.
var takeDigit = function(state, code) {
  if (
    (code !== 'num.' || state.contingentButtons.dot[1])
    && (code !== 'num0' || state.contingentButtons.zero[1])
  ) {
    if (state.numString) {
      state.numString = clean(numCharPush(state.numString, code), false);
    }
    else {
      state.numString = clean(numCharOf(code), false);
      if (state.op) {
        state.terms.push(state.op);
        state.op = undefined;
      }
    }
    finish(state);
  }
};

var contingentButtonOf = function(code) {
  var buttonMap = {
    'op+': 'plus',
    'op-': 'minus',
    'op*': 'times',
    'op/': 'over'
  };
  return buttonMap[code] || '';
};

/*
  Define a function that responds to a binary operator entry. Make it the
  uncommitted operator of the state, replacing any existing one. If there
  are an uncommitted number and terms, perform their operation and replace
  the terms with the result. If there are no terms but there is an uncommitted
  number, commit it. Precondition: code is a binary operator code.
*/
var takeBinary = function(state, code) {
  if (state.contingentButtons[contingentButtonOf(code)][1]) {
    if (state.numString) {
      if (state.terms.length) {
        var result = perform(state);
        if (result.length) {
          state.terms = [clean(result, true)];
          state.numString = '';
          state.op = code;
        }
      }
      else {
        state.terms = [clean(state.numString, true)];
        state.numString = '';
        state.op = code;
      }
      finish(state);
    }
    else if (state.op) {
      state.op = code;
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
      state.numString = numCharPop(state.numString);
      if (!state.numString.length) {
        state.numString = '';
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
  is an uncommitted numString, there is no committed term, and the string
  has any decimal digits, round the string to 1 fewer decimal digit.
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
var inputRespond = function(code) {
  var state = session.getState();
  if (numCharOf(code)) {
    var priorLength
      = state.numString.length
      + (state.terms.length ? state.terms[0].length : 0);
    if (priorLength < 40) {
      takeDigit(state, code);
    }
  }
  else if (opCharOf(code)) {
    takeBinary(state, code);
  }
  else if (['op^', 'op1'].includes(code)) {
    takeModifier(state, code);
  }
  else if (code === 'op!') {
    takeDel(state);
  }
  else if (code === 'op=') {
    takeEqual(state);
  }
  else if (code === 'op~') {
    takeRound(state);
  }
};

// Define an event handler for a mouse click.
var clickRespond = function(event) {
  inputRespond(realTargetOf(event.target));
};

// Define an event handler for a keyboard keypress.
var keyRespond = function(event) {
  var code = buttonOf(event.key);
  if (code) {
    inputRespond(code);
  }
};

// /// EXECUTION /// //

// Create event listeners
document.getElementById('buttons').addEventListener('click', clickRespond);
window.addEventListener('keydown', keyRespond);
