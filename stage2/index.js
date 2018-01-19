// /// STRING MANIPULATION /// //

/*
  Define a function that returns an analysis of a numString, i.e. an array of:
    (0) its multiplier
    (1) its multiplicand
    (2) whether it has an inverter
    (3) whether it has a negator
*/
var parse = function(numString) {
  return [
    numString.replace(/^[⅟-]+|e.+$/g, ''),
    numString.replace(/^[^e]+/, ''),
    numString.startsWith('⅟'),
    numString.includes('-')
  ];
};

// Define a function that returns a numString of an analysis.
var unparse = function(analysis) {
  return (analysis[2] ? '⅟' : '')
    + (analysis[3] ? '-' : '')
    + analysis[0]
    + analysis[1];
};

/*
  Define a function that enforces the restrictions on a valid, nonblank
  numString or terms[0].
*/
var clean = function(string, isTerm) {
  var analysis = parse(string);
  var digitGroups = analysis[0].split('.');
  digitGroups[0] = digitGroups[0].replace(/^0+(?=\d)/, '');
  if (!digitGroups[0].length) {
    digitGroups[0] = '0';
  }
  if (isTerm) {
    if (digitGroups.length === 1) {
      digitGroups.push('');
    }
    digitGroups[1] = digitGroups[1].replace(/0+$/, '');
    analysis[0] = digitGroups[0] + (
      digitGroups[1].length ? '.' + digitGroups[1] : ''
    );
    if (analysis[2]) {
      analysis[0] = (1 / Number.parseFloat(analysis[0] + analysis[1])).toString();
      analysis[2] = false;
    }
    if (analysis[3] && analysis[0] === '0') {
      analysis[3] = false;
    }
  }
  else {
    analysis[0] = digitGroups.join('.');
  }
  return unparse(analysis);
};

// Define a function that toggles the negator or inverter of a numString.
var toggledOf = function(numString, prefix) {
  var analysis = parse(numString);
  var prefixIndex = 2 + ['⅟', '-'].indexOf(prefix);
  analysis[prefixIndex] = !analysis[prefixIndex];
  return unparse(analysis);
};

/*
  Define a function that returns a `numString` with the last character of its
  multiplier removed and, if the removal leaves it empty, with any inverter
  or negator deleted.
*/
var charPop = function(numString) {
  var analysis = parse(numString);
  if (analysis[0].length === 1) {
    return '';
  }
  else {
    analysis[0] = analysis[0].slice(0, -1);
    return unparse(analysis);
  }
};

/*
  Define a function that returns a `numString`, formatted as a `term[0]` and
  with its multiplier rounded down by 1 decimal digit, subject to a maximum
  count of decimal digits.
*/
var round = function(numString, decimalsMax) {
  var cleanedString = clean(numString, true);
  var analysis = parse(cleanedString);
  var dotIndex = analysis[0].indexOf('.');
  if (dotIndex > -1) {
    analysis[0] = Number.parseFloat(analysis[0])
      .toFixed(Math.min(decimalsMax, analysis[0].length - dotIndex -2));
  }
  return unparse(analysis);
};

/*
  Define a function that returns an input code that corresponds to a key text,
  or an empty string if none.
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
  Define a function that converts an input code to the character that it
  represents.
*/
var charOf = function(code) {
  if (code.startsWith('num')) {
    return code.slice(-1);
  }
  else if (code.startsWith('op')) {
    return '÷×–+'['/*-+'.indexOf(code.slice(-1))];
  }
  else {
    return '';
  }
};

// Define a function that returns the HTML of a numString.
var htmlOf = function(numString) {
  if (numString.startsWith('⅟')) {
    return '<span class="tight hi">1/</span>' + numString.slice(1);
  }
  else {
    return numString;
  }
};

/*
  Define a function that returns a numString with a character appended to the
  multiplier.
*/
var charAppend = function(numString, code) {
  var analysis = parse(numString);
  analysis[0] += charOf(code);
  return unparse(analysis);
};

// /// STATE INTERROGATION /// //

/*
  Define a local object representing the document’s state and global methods
  that get and set the state. Initialize the state’s properties.
*/
var session = (function() {
  var state = {
    numString: '',
    binaryOp: undefined,
    terms: [],
    volatiles: {
      'num0': ['std', true],
      'num.': ['std', true],
      'op+': ['op', false],
      'op-': ['op', false],
      'op*': ['op', false],
      'op/': ['op', false],
      'op^': ['op', false],
      'op1': ['op', false],
      'op!': ['op', false],
      'op~': ['op', false],
      'op=': ['op', false]
    }
  };
  return {
    getState: function() {return JSON.parse(JSON.stringify(state));},
    setState: function(newState) {state = JSON.parse(JSON.stringify(newState));}
  };
})();

/*
  Define a function that returns, as a string, the result of a calculation.
*/
var perform = function(state) {
  var num0 = Number.parseFloat(state.terms[0]);
  var num1 = Number.parseFloat(clean(state.numString, true));
  var result;
  switch (state.terms[1]) {
    case '÷': result = num0 / num1; break;
    case '×': result = num0 * num1; break;
    case '–': result = num0 - num1; break;
    case '+': result = num0 + num1; break;
  }
  return typeof result === 'number' ? result.toString() : '';
};

// /// STATE MODIFICATION: ENTRY-TYPE-SPECIFIC /// //

// Define a function that displays the state in the calculator.
var showState = function(state) {
  var views = [];
  views.push(state.terms[0] || '');
  views.push(state.terms[1] || '');
  views.push(state.numString ? htmlOf(state.numString) : '');
  views.push(state.binaryOp || '');
  var viewElement = document.getElementById('result');
  viewElement.innerHTML
    = views.filter(function(view) {return view.length;}).join(' ');
  var viewLength = viewElement.textContent.length;
  viewElement.style.fontSize
    = (viewLength > 11 ? Math.ceil(2475 / viewLength): 225).toString() + '%';
};

// Define a function that makes all and only eligible buttons responsive.
var setButtons = function(state) {
  state.volatiles['num0'][1]
    = !state.numString || parse(state.numString)[0] !== '0';
  state.volatiles['num.'][1]
    = !state.numString || !state.numString.includes('.');
  state.volatiles['op+'][1] = Boolean(
    state.numString || (state.terms.length && state.binaryOp !== '+')
  );
  state.volatiles['op-'][1] = Boolean(
    state.numString || (state.terms.length && state.binaryOp !== '–')
  );
  state.volatiles['op*'][1] = Boolean(
    state.numString || (state.terms.length && state.binaryOp !== '×')
  );
  state.volatiles['op/'][1] = Boolean(
    state.numString || (state.terms.length && state.binaryOp !== '÷')
  );
  state.volatiles['op^'][1]
    = state.volatiles['op1'][1] = Boolean(state.numString);
  state.volatiles['op!'][1] = Boolean(
    state.numString || state.binaryOp || state.terms.length
  );
  state.volatiles['op='][1] = Boolean(state.terms.length && state.numString);
  state.volatiles['op~'][1] = Boolean(
    state.numString && (state.terms.length || state.numString.includes('.'))
  );
  session.setState(state);
  for (var buttonID in state.volatiles) {
    var button = document.getElementById(buttonID);
    if (state.volatiles[buttonID][1]) {
      button.classList.remove('button-off');
      button.classList.add('button-on');
    }
    else {
      button.classList.remove('button-on');
      button.classList.add('button-off');
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
    state.numString = result;
    state.terms = [];
    state.binaryOp = undefined;
    finish(state);
  }
};

// Define a function that responds to a modifier entry.
var takeModifier = function(state, opCode, opChar) {
  if (state.volatiles[opCode][1]) {
    state.numString = toggledOf(state.numString, opChar);
    finish(state);
  }
};

// Define a function that responds to an inverter entry.
var takeInverter = function(state) {
  takeModifier(state, 'op1', '⅟');
};

// Define a function that responds to a negator entry.
var takeNegator = function(state) {
  takeModifier(state, 'op^', '-');
};

// Define a function that makes a binary operator `term[1]`.
var termifyOp = function(state) {
  if (state.binaryOp) {
    state.terms.push(state.binaryOp);
    state.binaryOp = undefined;
  }
};

/*
  Define a function that appends a character to `numString` and, if that
  initializes `numString`, makes `op` `term[1]`.
*/
var growNumString = function(state, code) {
  if (state.numString) {
    state.numString = clean(charAppend(state.numString, code), false);
  }
  else {
    state.numString = clean(charOf(code), false);
    termifyOp(state);
  }
  finish(state);
}

// Define a function that responds to a positive digit entry.
var takePositive = function(state, code) {
  growNumString(state, code);
};

// Define a function that responds to a digit or decimal-point entry.
var takeZero = function(state) {
  if (state.volatiles['num0'][1]) {
    growNumString(state, 'num0');
  }
};

// Define a function that responds to a digit or decimal-point entry.
var takeDot = function(state) {
  if (state.volatiles['num.'][1]) {
    growNumString(state, 'num.');
  }
};

// Define a function that responds to a binary operator input.
var takeBinary = function(state, code) {
  if (state.volatiles[code][1]) {
    if (state.numString) {
      if (state.terms.length) {
        var result = perform(state);
        if (result.length) {
          state.terms = [clean(result, true)];
        }
      }
      else {
        state.terms = [clean(state.numString, true)];
      }
    }
    state.numString = '';
    state.binaryOp = charOf(code);
    finish(state);
  }
};

// Define a function that responds to a deletion operator input.
var takeDel = function(state) {
  if (state.volatiles['op!'][1]) {
    if (state.numString) {
      state.numString = charPop(state.numString);
      if (!state.numString.length) {
        state.numString = '';
        if (state.terms.length) {
          state.binaryOp = state.terms.pop();
        }
      }
    }
    else if (state.binaryOp) {
      state.binaryOp = undefined;
      state.numString = state.terms.pop();
    }
    finish(state);
  }
};

// Define a function that responds to a calculation operator input.
var takeEqual = function(state) {
  if (state.volatiles['op='][1]) {
    finishResult(state, perform(state));
  }
};

// Define a function that responds to a rounding operator input.
var takeRound = function(state) {
  if (state.volatiles['op~'][1]) {
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
  if (charOf(code)) {
    var priorLength
      = state.numString.length
      + (state.terms.length ? state.terms[0].length : 0);
    if (priorLength < 40) {
      if (code === 'num.') {
        takeDot(state);
      }
      else if (code === 'num0') {
        takeZero(state);
      }
      else if (code.startsWith('num')) {
        takePositive(state, code);
      }
      else if (code.startsWith('op')) {
        takeBinary(state, code);
      }
    }
  }
  else if (code === 'op1') {
    takeInverter(state);
  }
  else if (code === 'op^') {
    takeNegator(state);
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
  inputRespond(event.target.id);
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
