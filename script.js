const expressionDisplay = document.getElementById("expression");
const numberButtons = document.querySelectorAll(".number-btn");
const zeroButton = document.getElementById("zero");
const commaButton = document.getElementById("comma");
const operatorButtons = document.querySelectorAll(".operator");
const percentButton = document.getElementById("percent");
const bracketsButton = document.getElementById("brackets");
const negationButton = document.getElementById("negation-btn");
const eraseBtn = document.querySelector(".erase");
const clearButton = document.getElementById("clear-btn");

const numberRegex = /\d+$/;
/*
 * \u00F7 = Unicode division sign.
 * \u00D7 = Unicode multiplication sign.
 */
const operatorRegex = /[\u00F7\u00D7\+\-]$/;
let openBrackets = 0;

numberButtons.forEach((button) => {
  button.addEventListener("click", () => {
    let expression = expressionDisplay.value;

    if (expression.match(/\)$/) || expression.match(/%$/)) {
      expression += `\u00D7${button.dataset.value}`;
      expressionDisplay.value = expression;
      return;
    }

    expression += button.dataset.value;
    expressionDisplay.value = expression;
  });
});

zeroButton.addEventListener("click", () => {
  let expression = expressionDisplay.value;
  if (expression.match(/[\)%]$/)) {
    expression += `\u00D7${zeroButton.dataset.value}`;
    expressionDisplay.value = expression;
    return;
  }
  expression += zeroButton.dataset.value;
  expressionDisplay.value = expression;
});

commaButton.addEventListener("click", () => {
  let expression = expressionDisplay.value;

  if (expression.match(/\d+,\d*$/) || expression.length === 0) {
    return;
  }
  if (expression.match(/[\)%]$/)) {
    expression += `\u00D70${commaButton.dataset.value}`;
    expressionDisplay.value = expression;
    return;
  }

  if (expression.match(operatorRegex) || expression.match(/\($/)) {
    expression += `0${commaButton.dataset.value}`;
    expressionDisplay.value = expression;
    return;
  }

  expression += commaButton.dataset.value;
  expressionDisplay.value = expression;
});

operatorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    let expression = expressionDisplay.value;
    let last = expression[expression.length - 1];

    if (expression.match(operatorRegex)) {
      if (
        expression[expression.length - 2] === "(" &&
        !(button.dataset.value === "+" || button.dataset.value === "-")
      ) {
        return;
      }
      expression = expression.replace(operatorRegex, button.dataset.value);
      expressionDisplay.value = expression;
      return;
    }

    if (expression.match(numberRegex) || expression.match(/[\)%]$/)) {
      expression += button.dataset.value;
      expressionDisplay.value = expression;
      return;
    }

    if (
      expression.match(/\($/) &&
      (button.dataset.value === "+" || button.dataset.value === "-")
    ) {
      expression += button.dataset.value;
      expressionDisplay.value = expression;
      return;
    }

    if (last === ",") {
      expression += `0${button.dataset.value}`;
      expressionDisplay.value = expression;
      return;
    }
  });
});

percentButton.addEventListener("click", () => {
  let expression = expressionDisplay.value;
  let last = expression[expression.length - 1];

  if (!(expression.match(numberRegex) || expression.match(/\)|,$/))) {
    return;
  }

  if (last === ",") {
    expression += `0${percentButton.dataset.value}`;
    expressionDisplay.value = expression;
    return;
  }

  expression += percentButton.dataset.value;
  expressionDisplay.value = expression;
});

clearButton.addEventListener("click", () => {
  openBrackets = 0;
  expressionDisplay.value = "";
});

eraseBtn.addEventListener("click", () => {
  let expression = expressionDisplay.value;
  let last = expression[expression.length - 1];

  if (expression.length === 0) {
    return;
  }

  if (last === "(") {
    openBrackets--;
  }

  if (last === ")") {
    openBrackets++;
  }
  let remaining = expression.split("");
  remaining.splice(remaining.length - 1, 1);

  expressionDisplay.value = remaining.join("");
});

bracketsButton.addEventListener("click", () => {
  let expression = expressionDisplay.value;
  let last = expression[expression.length - 1];

  if (
    expression.length === 0 ||
    expression.match(operatorRegex) ||
    last === "("
  ) {
    expression += "(";
    openBrackets++;
    expressionDisplay.value = expression;
    return;
  }

  if (expression.match(numberRegex) || last === "%" || last === ")") {
    if (openBrackets > 0) {
      expression += ")";
      openBrackets--;
    } else {
      expression += "\u00D7(";
      openBrackets++;
    }

    expressionDisplay.value = expression;
    return;
  }

  if (last === ",") {
    if (openBrackets > 0) {
      expression += "0)";
      openBrackets--;
    } else {
      expression += "0\u00D7(";
      openBrackets++;
    }
    expressionDisplay.value = expression;
    return;
  }
});

negationButton.addEventListener("click", () => {
  let expression = expressionDisplay.value;
  let last = expression[expression.length - 1];

  if (last === "%" || last === ")") {
    expression += "\u00D7(-";
    openBrackets++;
    expressionDisplay.value = expression;
    return;
  }

  if (expression.match(/\(\-(?=\d*,?\d*$)/)) {
    expression = expression.replace(/\(\-(?=\d*,?\d*$)/, "");
    openBrackets--;
    expressionDisplay.value = expression;
    return;
  }

  if (
    expression.length === 0 ||
    expression.match(operatorRegex) ||
    last === "("
  ) {
    expression += "(-";
    openBrackets++;
    expressionDisplay.value = expression;
    return;
  }

  const numMatch = expression.match(/\d+,?\d*$/);
  if (numMatch) {
    const num = numMatch[0];
    expression = expression.replace(/\d+,?\d*$/, `(-${num}`);
    openBrackets++;
    expressionDisplay.value = expression;
    return;
  }
});
