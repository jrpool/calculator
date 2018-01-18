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

Each input has a _code_: a unique identifier of that input. For example, the input of the digit `1` has the code `num1`. The input of the inversion operator (the operator that divides 1 by a number) is `op1`.

At any time, the application is in some _state_. The state is the facts that the user can still do something about without restarting the application. The state is composed of 4 facts:

- _numString_: a string representing a number, or the empty string.
- _binaryOp_: the string `+`, `-`, `×`, or `÷`, or else undefined.
- _terms_: an array of 0, 1, or 2 elements. If it has a first element, it is a string representing a number. If it also has a second element, it is the string `+`, `-`, `×`, or `÷`.
- _volatiles_: an array of data about inputs that cannot always be performed.

The format of any string representing a number is exemplified by `-⅟1234.56e+15`. This represents the number you get when you multiply 1234.56 (called the _multiplier_) by 1,000,000,000,000,000 (called the _multiplicand_), then divide 1 by the result (indicated by the _inverter_), and then make that result negative (indicated by the _negator_). Such a string must contain at least one digit, but otherwise it can contain or omit all the components shown here. `e` stands for “10 the the power of”. The sign following `e` can be either `+` or `-`.

Some inputs—the digits 0 to 9—are always performable. All the other inputs are volatile: Whether they can be performed depends on the values of `numString`, `binaryOp`, and `terms`. For each volatile input, the `volatiles` property specifies whether it can currently be performed. For example, if the state is empty, the only performable volatile is the decimal point. If you then enter a digit, 7 more volatiles (such as `+`) become performable. At any time, only the performable inputs are enabled; the other inputs are disabled. When an input is disabled, its button and its keypresses have no effect.

The state is always displayed in the calculator. The `terms` elements and the `numString` are concatenated and displayed at the top. An example is `-456.78 ÷ 31`, where `31` is the `numString`. The `volatiles` are displayed by means of the buttons’ appearances: bright if enabled, and dim if disabled.

The application imposes some restrictions on the formats of strings representing numbers.

- If it is `numString`, then its multiplier cannot begin with '0'
  immediately followed by another digit, and also cannot contain “.” before its first digit. So, the application converts `0056` to `56`, and it converts `.5` to `0.5`.
- If it is the first element of `terms`, there are additional restrictions:
    - No inverter. The application calculates the reciprocal and displays that.
    - No multiplier consisting of `-0`. That is converted to `0`.
  3. No trailing `0`s in the multiplier after a decimal point.
  4. The multiplier may not end with `.`.

The `op^` input, performed with the `±` button or the`` ` ``key, toggles the sign of the `numString`.

The `op1` input, performed with the `⅟` button or the `\` key, toggles the presence of the inversion operator on the `numString`.

The `op~` input, performed with the `≅` button or the `~` key, rounds, and how it rounds depends on the state.

- If there are a `numString` and 2 terms, it performs the calculation with rounding.
- If there is a `numString` and no term, it rounds the `numString`.

The `op=` input, performed with the `=` button or the `=` or `Enter` key, performs the calculation (without rounding).

The `op!` input, performed with the `⌫` button or the `Backspace`, `Escape`, or `Clear` key, deletes the final character of the state.

A `binaryOp` input, performed with any of the buttons in the left-most column or with the `+` (plus), `-` (minus), `*` (times), or `/` or `÷` (divided by) key, has an effect that depends on the state.

- If there is no term, it converts the `numString` to a `term` and then makes itself the `binaryOp`.
- If there are 1 term and a `binaryOp`, it replaces the `binaryOp` with itself.
- If there are 2 terms and a `numString`, it performs the calculation with those 3 arguments, replaces the terms with the result as 1 term, and makes itself the `binaryOp`.

The calculator enforces a limit of 40 digits on the aggregate length of the numeric elements of the state.

The above rules, while not intuitive as presented, are intended to produce a calculator that does what the user’s intuition anticipates.

### Implementation

As required by the terms of the exercise, all JavaScript in this application is intended to conform to the ECMAScript 5 standard, omitting any features that were introduced in ECMAScript 2015. The intent is to make the application compatible with browsers that have not been updated to support ECMAScript 2015, as well as those that have been.

## Usage and Examples

Stage 1: To experience the product of stage 1, open the [stage-1 web page](https://jrpool.github.io/calculator/stage1/) in a web browser, hover over buttons, and click on buttons.

Stage 2: To experience the product of stage 2, open the [stage-2 web page](https://jrpool.github.io/calculator/stage2/) in a web browser, hover over buttons, and click on buttons.

[lg]: https://www.learnersguild.org
