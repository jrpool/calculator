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
  var prefixIndex = 2 + ['-', '⅟'].indexOf(prefix);
  parsed[prefixIndex] = !analysis[prefixIndex];
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
    return '<span class="tight hi">1/</span>' + numString.slice(1));
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

// /// CALCULATOR INTERROGATION /// //

// Define a function that returns the button imputable as the target of a click.
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
  views.push(state.terms[1] ? charOf(state.terms[1]) : '');
  views.push(state.numString ? htmlOf(state.numString) : '');
  views.push(state.op ? charOf(state.op) : '');
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

// Define a function that responds to a modifier entry.
var takeModifier = function(state, prefix) {
  if (state.contingentButtons.modifier[1]) {
    state.numString = toggledOf(state.numString, ['-', '⅟'][prefix]);
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
      state.numString = clean(charAppend(state.numString, code), false);
    }
    else {
      state.numString = clean(charOf(code), false);
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
  if (charOf(code)) {
    var priorLength
      = state.numString.length
      + (state.terms.length ? state.terms[0].length : 0);
    if (priorLength < 40) {
      takeDigit(state, code);
    }
  }
  else if (charOf(code)) {
    takeBinary(state, code);
  }
  else if (code === 'op^') {
    takeModifier(state, '-');
  }
  else if (code === 'op1') {
    takeModifier(state, '⅟');
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
