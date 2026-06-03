const expressionDisplay = document.getElementById("expression");
const numberButtons = document.querySelectorAll(".number-btn");
const zeroButton = document.getElementById("zero");
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

const performOperatorAssociativity = (
  firstOperator,
  SecondOperator,
  expression,
) => {
  while (
    expression.includes(firstOperator) ||
    expression.includes(SecondOperator)
  ) {
    const operatorIndex = expression.findIndex(
      (token) => token === firstOperator || token === SecondOperator,
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

answerButton.addEventListener("click", () => {
  let expression = expressionDisplay.value;
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

  expressionDisplay.value = expression[0].replace(".", ",");
});
