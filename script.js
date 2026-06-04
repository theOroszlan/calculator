const expressionDisplay = document.getElementById("expression");
const numberButtons = document.querySelectorAll(".number-btn");
const commaButton = document.getElementById("comma");
const operatorButtons = document.querySelectorAll(".operator");
const percentButton = document.getElementById("percent");
const bracketsButton = document.getElementById("brackets");
const negationButton = document.getElementById("negation-btn");
const answerButton = document.querySelector(".answer-btn");
const eraseBtn = document.querySelector(".erase");
const clearButton = document.getElementById("clear-btn");

const operations = {
  "*": (leftVariable, rightVariable) => leftVariable * rightVariable,
  "/": (leftVariable, rightVariable) => leftVariable / rightVariable,
  "+": (leftVariable, rightVariable) => leftVariable + rightVariable,
  "-": (leftVariable, rightVariable) => leftVariable - rightVariable,
};

const numberRegex = /\d+$/;
/*
 * \u00F7 = Unicode division sign.
 * \u00D7 = Unicode multiplication sign.
 */
const operatorRegex = /[\u00F7\u00D7\+\-]$/;
const tokensRegex = /\d+(\.\d+)?|[/\*\-\+\(\)\%]/g;
let openBrackets = 0;
const setExpression = (value) => {
  expressionDisplay.value = value;
};
const getExpression = () => expressionDisplay.value;

const appendNumber = (value) => {
  let expression = getExpression();

  if (expression.length === 1 && value === "0" && expression === "0") {
    return;
  }

  if (expression.match(/[\)%]$/)) {
    expression += `\u00D7${value}`;
    setExpression(expression);
    return;
  }

  expression += value;
  setExpression(expression);
};
const appendComma = (value) => {
  let expression = getExpression();

  if (expression.match(/\d+,\d*$/) || expression.length === 0) {
    return;
  }
  if (expression.match(/[\)%]$/)) {
    expression += `\u00D70${value}`;
    setExpression(expression);
    return;
  }

  if (expression.match(operatorRegex) || expression.match(/\($/)) {
    expression += `0${value}`;
    setExpression(expression);
    return;
  }

  expression += value;
  setExpression(expression);
};
const appendOperator = (value) => {
  let expression = getExpression();
  let last = expression[expression.length - 1];

  if (expression.match(operatorRegex)) {
    if (
      expression[expression.length - 2] === "(" &&
      !(value === "+" || value === "-")
    ) {
      return;
    }
    expression = expression.replace(operatorRegex, value);
    setExpression(expression);
    return;
  }

  if (expression.match(numberRegex) || expression.match(/[\)%]$/)) {
    expression += value;
    setExpression(expression);
    return;
  }

  if (expression.match(/\($/) && (value === "+" || value === "-")) {
    expression += value;
    setExpression(expression);
    return;
  }

  if (last === ",") {
    expression += `0${value}`;
    setExpression(expression);
    return;
  }
};
const appendPercent = (value) => {
  let expression = getExpression();
  let last = expression[expression.length - 1];

  if (!(expression.match(numberRegex) || expression.match(/\)|,$/))) {
    return;
  }

  if (last === ",") {
    expression += `0${value}`;
    setExpression(expression);
    return;
  }

  expression += value;
  setExpression(expression);
};
const backspace = () => {
  let expression = getExpression();
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

  setExpression(remaining.join(""));
};
const toggleParentheses = () => {
  let expression = getExpression();
  let last = expression[expression.length - 1];

  if (
    expression.length === 0 ||
    expression.match(operatorRegex) ||
    last === "("
  ) {
    expression += "(";
    openBrackets++;
    setExpression(expression);
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

    setExpression(expression);
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
    setExpression(expression);
    return;
  }
};
const toggleNegation = () => {
  let expression = getExpression();
  let last = expression[expression.length - 1];

  if (last === "%" || last === ")") {
    expression += "\u00D7(-";
    openBrackets++;
    setExpression(expression);
    return;
  }

  if (expression.match(/\(\-(?=\d*,?\d*$)/)) {
    expression = expression.replace(/\(\-(?=\d*,?\d*$)/, "");
    openBrackets--;
    setExpression(expression);
    return;
  }

  if (
    expression.length === 0 ||
    expression.match(operatorRegex) ||
    last === "("
  ) {
    expression += "(-";
    openBrackets++;
    setExpression(expression);
    return;
  }

  const numMatch = expression.match(/\d+,?\d*$/);
  if (numMatch) {
    const num = numMatch[0];
    expression = expression.replace(/\d+,?\d*$/, `(-${num}`);
    openBrackets++;
    setExpression(expression);
    return;
  }
};
const appendOpenParenthesis = () => {
  let expression = getExpression();
  let last = expression[expression.length - 1];

  if (last === ",") {
    expression += "0";
  }

  if (expression.match(/[\d)%]$/)) {
    expression += "\u00D7(";
  } else {
    expression += "(";
  }

  openBrackets++;
  setExpression(expression);
};
const appendCloseParenthesis = () => {
  let expression = getExpression();

  if (openBrackets <= 0) {
    return;
  }

  let last = expression[expression.length - 1];

  if (last === ",") {
    expression += "0";
  }

  expression += ")";
  openBrackets--;
  setExpression(expression);
};

const performOperatorAssociativity = (
  firstOperator,
  secondOperator,
  expression,
) => {
  while (
    expression.includes(firstOperator) ||
    expression.includes(secondOperator)
  ) {
    const operatorIndex = expression.findIndex(
      (token) => token === firstOperator || token === secondOperator,
    );

    const leftVariable = Number(expression[operatorIndex - 1]);
    const rightVariable = Number(expression[operatorIndex + 1]);
    const operator = expression[operatorIndex];

    const answer = operations[operator](leftVariable, rightVariable);

    expression.splice(operatorIndex - 1, 3, answer.toString());
  }
};
const evaluatePercentages = (expression) => {
  for (let i = 0; i < expression.length; i++) {
    if (expression[i] === "%") {
      const value = Number(expression[i - 1]);
      const result = value / 100;

      expression.splice(i - 1, 2, result.toString());
      i--;
    }
  }
};
const evaluateParanthesis = (expression) => {
  while (expression.includes("(")) {
    let stack = [];

    let start = null;
    let end = null;

    for (let i = 0; i < expression.length; i++) {
      if (expression[i] === "(") {
        stack.push(i);
      }

      if (expression[i] === ")") {
        start = stack.pop();
        end = i;
        break;
      }
    }

    let extracted = expression.slice(start + 1, end);

    performOperatorAssociativity("*", "/", extracted);
    performOperatorAssociativity("+", "-", extracted);

    const result = extracted[0];

    expression.splice(start, end - start + 1, result);
  }
};
const handleUnaryMinus = (expression) => {
  for (let i = 0; i < expression.length; i++) {
    if (
      expression[i] === "-" &&
      expression[i - 1] === "(" &&
      expression[i + 1]
    ) {
      expression[i + 1] = "-" + expression[i + 1];
      expression.splice(i, 1);
      i--;
    }
  }
};
const evaluate = (outputElement) => {
  let expression = getExpression();
  let last = expression[expression.length - 1];

  if (last === ",") {
    expression += "0";
    last = "0";
  }

  if (expression.match(/^\d+(,\d+)?$/) || expression.length === 0) {
    return;
  }

  if (expression.match(operatorRegex)) {
    return;
  }

  while (openBrackets > 0) {
    expression += ")";
    openBrackets--;
  }

  expression = expression
    .replace(/\u00F7/g, "/")
    .replace(/\u00D7/g, "*")
    .replaceAll(",", ".");

  expression = expression.match(tokensRegex);
  handleUnaryMinus(expression);
  evaluatePercentages(expression);
  evaluateParanthesis(expression);
  performOperatorAssociativity("/", "*", expression);
  performOperatorAssociativity("+", "-", expression);

  outputElement.value = expression[0].replace(".", ",");
};

numberButtons.forEach((button) => {
  button.addEventListener("click", () => appendNumber(button.dataset.value));
});

commaButton.addEventListener("click", () =>
  appendComma(commaButton.dataset.value),
);

operatorButtons.forEach((button) => {
  button.addEventListener("click", () => appendOperator(button.dataset.value));
});

percentButton.addEventListener("click", () =>
  appendPercent(percentButton.dataset.value),
);

clearButton.addEventListener("click", () => {
  openBrackets = 0;
  setExpression("");
});

eraseBtn.addEventListener("click", () => backspace());

bracketsButton.addEventListener("click", () => toggleParentheses());

negationButton.addEventListener("click", () => toggleNegation());

expressionDisplay.addEventListener("keydown", (e) => {
  e.preventDefault();
  const keyboardValue = e.key;

  if (keyboardValue.match(/\d/)) {
    appendNumber(keyboardValue);
    return;
  }

  switch (keyboardValue) {
    case "*":
      appendOperator("\u00D7");
      break;
    case "/":
      appendOperator("\u00F7");
      break;
    case "+":
      appendOperator(keyboardValue);
      break;
    case "-":
      appendOperator(keyboardValue);
      break;
    case "%":
      appendPercent(keyboardValue);
      break;
    case ",":
      appendComma(keyboardValue);
      break;
    case "(":
      appendOpenParenthesis();
      break;
    case ")":
      appendCloseParenthesis();
      break;
    case "Backspace":
      backspace();
      break;
    case "=":
    case "Enter":
      evaluate(expressionDisplay) ?? expressionDisplay.value;
      break;
  }
});

answerButton.addEventListener(
  "click",
  () => evaluate(expressionDisplay) ?? expressionDisplay.value,
);
window.addEventListener("click", () => {
  expressionDisplay.focus();
});
