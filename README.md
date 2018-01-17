# calculator

Web application implementing a calculator.

## Project Members

[Jonathan Pool](https://github.com/jrpool)

## Discussion

### General

This application demonstrates the use of the fundamental web languages, HTML, CSS, and JavaScript, to create an application that runs entirely inside a web browser.

The demonstration takes the form of an arithmetic calculator.

The application fulfilled a variation on the requirements of the “Mac Calculator Clone” exercise of the “JavaScript in the Browser” module in Phase 2 of the [Learners Guild][lg] curriculum, as it existed in mid-2017. The exercise required cloning the functionality of the Macintosh OS X operating system’s “Calculator” application (basic view), but this application modifies that functionality. The intent is to make a calculator with superior functionality and a more intuitive interface.

The exercise built the application in 2 stages.

Stage 1 constructed a clone of the appearance and aesthetic response of the Calculator application of the Macintosh OS X operating system. The calculator responded to hovering and to clicks by darkening the target elements. Its appearance and response were produced by HTML and CSS code. Stage 1 of the calculator did not calculate.

Stage 2 adds JavaScript code to make the calculator perform calculating operations in response to user actions. Stage 2 also changes the layout of the calculator and the set of its buttons. It also changes the appearance of the buttons, making them dim and inert when the state of the calculator makes them ineligible for use.

Additional work on stage 2 is taking place in early 2018 so that the application can be more accessible and usable.

There is a [more detailed discussion](http://stulta.com/forumo/archives/2089) of this variation and its motivation.

### Logic

Stage 2 of the application is based on the following concepts and rules.

An _input_ is a single button or keypress that a user can perform. For each input, there is a button and there is at least 1 keypress that can perform it.

Each input has a _code_, a unique identifier of that input.

At any time, the application is in some _state_. The state is the facts that the user can still do something about without restarting the application. The state is composed of 4 facts:

- _arg0_: a number.
- _binaryOp_: a function of 2 numeric arguments.
- _arg1_: a number.
- _potentials_: a record of the inputs that can currently be made.

Not all inputs are potentials. Given a state, some inputs are appropriate and others are not. Only the appropriate inputs are potentials. For example, if the state is empty, the only potentials are the digits 0–9 and the decimal point. At any time, only the potentials are enabled; the other inputs are disabled, and their buttons are marked to show this.

At each time, the state is displayed at the top of the calculator, represented by a string.

Internally, the state is represented as an array of 4 elements:

- arg0: a string representing a number. It can optionally begin with “-” and otherwise consists of digits and an optional decimal point.
- the code of a binaryOp.
- arg1: a string representing a number, optionally beginning with a _negator_ (–) and/or an _inverter_ (⅟), followed by a _multiplier_ (a string of digits, optionally with a decimal point), and then by an optional _multiplicand_ ('e' followed by a string of digits, optionally including a decimal point).
- potentials: an object with a property for each input that can ever fail to be a potential, stating whether it currently is a potential.

Each of them is composed of the following substrings in this order:

- An optional _negator_ (–).
- An optional _inverter_ (⅟).
- A _multiplier_ (a string of digits, optionally including a decimal point).
- An optional _multiplicand_ ('e' followed by a string of digits, optionally including a decimal point).

re is a _display_ at the top showing the _state_ in the form of a string.

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


### Implementation

As required by the terms of the exercise, all JavaScript in this application is intended to conform to the ECMAScript 5 standard, omitting any features that were introduced in ECMAScript 2015. The intent is to make the application compatible with browsers that have not been updated to support ECMAScript 2015, as well as those that have been.

## Usage and Examples

Stage 1: To experience the product of stage 1, open the [stage-1 web page](https://jrpool.github.io/calculator/stage1/) in a web browser, hover over buttons, and click on buttons.

Stage 2: To experience the product of stage 2, open the [stage-2 web page](https://jrpool.github.io/calculator/stage2/) in a web browser, hover over buttons, and click on buttons.

[lg]: https://www.learnersguild.org
