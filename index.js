// /// STRING MANIPULATION /// //

/*
  Define a function that returns an analysis of a numString, i.e. an array of:
    (0) its multiplier as a string
    (1) its multiplicand as a string
    (2) whether it has a reciprocalizer
    (3) whether it has a negator
*/
var parse = function(numString) {
  return [
    numString.replace(/^[⅟-]+|e.+$/g, ''),
    numString.replace(/^[^e]+/, ''),
    numString.indexOf('⅟') === 0,
    numString.indexOf('-') > -1
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
      analysis[0] = (
        1 / Number.parseFloat(analysis[0] + analysis[1])
      ).toString();
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

// Define a function that toggles the negator or reciprocalizer of a numString.
var toggledOf = function(numString, prefix) {
  var analysis = parse(numString);
  var prefixIndex = 2 + ['⅟', '-'].indexOf(prefix);
  analysis[prefixIndex] = !analysis[prefixIndex];
  return unparse(analysis);
};

/*
  Define a function that removes the last decimal digit of a `numString` with
  rounding, removing any post-decimal-point trailing zeros and then removing
  the decimal point if no digit is left after it.
  Precondition: The `numString` has at least 1 decimal digit.
*/
var roundPop = function(numString) {
  var newPrecision = numString.length - numString.indexOf('.') - 2;
  var analysis = parse(numString);
  var maximalNewString = Number.parseFloat(analysis[0]).toFixed(newPrecision);
  analysis[0] = Number.parseFloat(maximalNewString).toString();
  return unparse(analysis);
};

/*
  Define a function that returns a `numString` with the last character of its
  multiplier removed and, if the removal leaves it empty, with any
  reciprocalizer or negator deleted.
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
  Define a function that returns an input code that corresponds to a key text,
  or an empty string if none.
*/
var inputCodeOf = function(keyText) {
  var keyCodeMap = {
    '÷': 'op/',
    '/': 'op/',
    '7': 'num7',
    '8': 'num8',
    '9': 'num9',
    '±': 'op^',
    '`': 'op^',
    '×': 'op*',
    '*': 'op*',
    '4': 'num4',
    '5': 'num5',
    '6': 'num6',
    '⅟': 'op1',
    '\\': 'op1',
    '−': 'op-',
    '–': 'op-',
    '-': 'op-',
    '1': 'num1',
    '2': 'num2',
    '3': 'num3',
    'Backspace': 'op!',
    '+': 'op+',
    '0': 'num0',
    '.': 'num.',
    '=': 'op=',
    '≈': 'op~',
    '~': 'op~'
  };
  return keyCodeMap[keyText] || '';
};

/*
  Define a function that converts an input code to the character that it
  represents.
*/
var charOf = function(code) {
  if (code.indexOf('num') === 0) {
    return code.slice(-1);
  }
  else if (code.indexOf('op') === 0) {
    return '÷×–+'['/*-+'.indexOf(code.slice(-1))];
  }
  else {
    return '';
  }
};

// Define a function that returns the HTML of a numString.
var htmlOf = function(numString) {
  if (numString.indexOf('⅟') === 0) {
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
    inputs: {
      'num0': ['std', true],
      'num1': ['std', true],
      'num2': ['std', true],
      'num3': ['std', true],
      'num4': ['std', true],
      'num5': ['std', true],
      'num6': ['std', true],
      'num7': ['std', true],
      'num8': ['std', true],
      'num9': ['std', true],
      'num.': ['std', true],
      'op=': ['op', false],
      'op+': ['op', false],
      'op-': ['op', false],
      'op*': ['op', false],
      'op/': ['op', false],
      'op^': ['op', false],
      'op1': ['op', false],
      'op!': ['op', false],
      'op~': ['op', false]
    },
    round: true
  };
  var inputs = Object.keys(state.inputs);
  for (var i = 0; i < inputs.length - 1; i++) {
    state.inputs[inputs[i]].push(inputs[i + 1]);
  }
  state.inputs[inputs[inputs.length - 1]].push(inputs[0]);
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
  if (typeof result === 'number') {
    return clean(result.toString(), true);
  }
  else {
    return '';
  }
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

/*
  Define a function that enables all and only eligible inputs and makes all
  and only their buttons focusable.
*/
var setInputs = function(state) {
  var binaryOp = state.binaryOp;
  var numString = state.numString;
  var dotIndex = numString ? numString.indexOf('.') : -1;
  var termCount = state.terms.length;
  var notTooLong = 40 > numString.length + (
    termCount ? state.terms[0].length : 0
  );
  state.inputs['num0'][1] = notTooLong && (
    !numString || parse(numString)[0] !== '0'
  );
  state.inputs['num.'][1] = notTooLong && (
    !numString || numString.indexOf('.') === -1
  );
  state.inputs['num1'][1] = notTooLong;
  state.inputs['num2'][1] = notTooLong;
  state.inputs['num3'][1] = notTooLong;
  state.inputs['num4'][1] = notTooLong;
  state.inputs['num5'][1] = notTooLong;
  state.inputs['num6'][1] = notTooLong;
  state.inputs['num7'][1] = notTooLong;
  state.inputs['num8'][1] = notTooLong;
  state.inputs['num9'][1] = notTooLong;
  state.inputs['op='][1] = Boolean(termCount && numString);
  state.inputs['op+'][1] = notTooLong && Boolean(
    numString || (termCount && binaryOp !== '+')
  );
  state.inputs['op-'][1] = notTooLong && Boolean(
    numString || (termCount && binaryOp !== '–')
  );
  state.inputs['op*'][1] = notTooLong && Boolean(
    numString || (termCount && binaryOp !== '×')
  );
  state.inputs['op/'][1] = notTooLong && Boolean(
    numString || (termCount && binaryOp !== '÷')
  );
  state.inputs['op^'][1]
    = state.inputs['op1'][1] = Boolean(numString);
  state.inputs['op!'][1] = Boolean(
    numString || binaryOp || termCount
  );
  state.inputs['op~'][1] = Boolean(
    numString && dotIndex > -1 && dotIndex < numString.length - 1
  );
  session.setState(state);
  for (var inputCode in state.inputs) {
    var button = document.getElementById(inputCode);
    if (state.inputs[inputCode][1]) {
      button.classList.remove('button-off');
      button.classList.add('button-on');
      button.setAttribute('tabindex', button.getAttribute('tx'));
    }
    else {
      button.classList.remove('button-on');
      button.classList.add('button-off');
      button.setAttribute('tabindex', '-1');
      if (document.activeElement === button) {
        var newFocus;
        if (document.getElementById('num0').classList.contains('button-on')) {
          newFocus = 'num0';
        }
        else if (
          button.id === 'num0'
          && document.getElementById('num.').classList.contains('button-on')
        ) {
          newFocus = 'num.';
        }
        else {
          newFocus = 'op!';
        }
        document.getElementById(newFocus).focus();
      }
    }
  }
};

/*
  Define a function that shows the state in the calculator, saves the state,
  and enables/disables inputs.
*/
var finish = function(state) {
  session.setState(state);
  showState(state);
  setInputs(state);
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
  if (state.inputs[code][1]) {
    if (state.numString) {
      state.numString = clean(charAppend(state.numString, code), false);
    }
    else {
      state.numString = clean(charOf(code), false);
      termifyOp(state);
    }
    finish(state);
  }
}

// Define a function that responds to a digit or decimal-point entry.
var takeZero = function(state) {
  growNumString(state, 'num0');
};

// Define a function that responds to a positive digit entry.
var takePositive = function(state, code) {
  growNumString(state, code);
};

// Define a function that responds to a digit or decimal-point entry.
var takeDot = function(state) {
  growNumString(state, 'num.');
};

// Define a function that responds to a binary operator input.
var takeBinary = function(state, code) {
  if (state.inputs[code][1]) {
    if (state.numString) {
      if (state.terms.length) {
        var result = perform(state);
        if (result.length) {
          state.terms = [clean(result, true)];
          state.numString = '';
        }
      }
      else {
        state.terms = [clean(state.numString, true)];
        state.numString = '';
      }
    }
    state.binaryOp = charOf(code);
    finish(state);
  }
};

// Define a function that responds to a modifier entry.
var takeModifier = function(state, opCode, opChar) {
  if (state.inputs[opCode][1]) {
    state.numString = toggledOf(state.numString, opChar);
    finish(state);
  }
};

// Define a function that responds to a negator entry.
var takeNegator = function(state) {
  takeModifier(state, 'op^', '-');
};

// Define a function that responds to a reciprocalizer entry.
var takeInverter = function(state) {
  takeModifier(state, 'op1', '⅟');
};

// Define a function that responds to a truncation or rounding operator input.
var takeShorten = function(state, round) {
  if (state.inputs[round ? 'op~' : 'op!'][1]) {
    if (state.numString) {
      state.numString
        = round ? roundPop(state.numString) : charPop(state.numString);
      if (!state.numString.length && state.terms.length) {
        state.binaryOp = state.terms.pop();
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
  if (state.inputs['op='][1]) {
    finishResult(state, perform(state));
  }
};

// /// STATE MODIFICATION: GENERAL /// //

// Define a utility for the event handlers.
var inputRespond = function(code) {
  var state = session.getState();
  if (code === 'num.') {
    takeDot(state);
  }
  else if (code === 'num0') {
    takeZero(state);
  }
  else if (code.indexOf('num') === 0) {
    takePositive(state, code);
  }
  else if (code === 'op1') {
    takeInverter(state);
  }
  else if (code === 'op^') {
    takeNegator(state);
  }
  else if (code === 'op!') {
    takeShorten(state, false);
  }
  else if (code === 'op~') {
    takeShorten(state, true);
  }
  else if (code === 'op=') {
    takeEqual(state);
  }
  else if (code.indexOf('op') === 0) {
    takeBinary(state, code);
  }
};

// Define an event handler for a mouse click.
var clickRespond = function(event) {
  inputRespond(event.target.id);
};

//

// Define an event handler for a keyboard keypress.
var keyRespond = function(event) {
  var code = inputCodeOf(event.key);
  if (code) {
    document.getElementById(code).focus();
    inputRespond(code);
  }
};

// /// EXECUTION /// //

// Create event listeners.
document.getElementById('buttons').addEventListener('click', clickRespond);
window.addEventListener('keydown', keyRespond);
