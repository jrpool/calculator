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
var respond = function respond(event) {
  var buttonText = imputedText(event.target);
  document.getElementById('result').innerText = buttonText;
};

document.getElementById("buttons0").addEventListener('click', respond);
