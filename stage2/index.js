/*
  Define a function to return the text imputable to an element in the
  interactive section of the calculator.
*/
var imputedText = function imputedText(element) {
  var classList = element.className.split(' ');
  if (classList.includes('text')) {
    return element.textContent;
  }
  else if (classList.includes('calculator-button-area')) {
    if (classList.includes('vacant')) {
      return element.previousElementSibling.innerText;
    }
    else {
      return element.innerText;
    }
  }
  else if (classList.includes('calculator-button')) {
    return element.innerText;
  }
  else if (element.tagName.toLowerCase() === 'span') {
    return element.parentNode.innerText;
  }
  else {
    return '';
  }
};

// Define a function to respond to a button click.
var clickRespond = function clickRespond(event) {
  var buttonText = imputedText(event.target);
  document.getElementById('result').innerText += buttonText;
};

// Define a function to respond to a keypress.
var keyRespond = function keyRespond(event) {
  var buttonKeys = {
    'Clear': 'C',
    'Escape': ['C', 'AC'],
    'Dead': 'AC',
    '–': '+∕−',
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
    '0': '0',
    '.': '.',
    '=': '=',
  };
  if (Object.keys(buttonKeys).includes(event.key)) {
    var meaning = buttonKeys[event.key];
    if (Array.isArray(meaning)) {
      meaning = meaning[event.altKey ? 1 : 0];
    }
    document.getElementById('result').innerText += meaning;
  }
};

// Event listeners
document.getElementById('buttons0').addEventListener('click', clickRespond);
window.addEventListener('keydown', keyRespond);
