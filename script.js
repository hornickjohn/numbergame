var currentNumber = 0;

var operandStates = [];
for(var i = 0; i < puzzle.length; i++) {
    operandStates.push([]);
}

var selectedOperand = -1;
var selectedOperator = -1;

var tabs = document.querySelectorAll("#tabs button");
var operators = document.querySelectorAll("#operators div");
var operands = document.querySelectorAll("#operands div");
var operandSpans = document.querySelectorAll("#operands div span");

function Load() {
    for(var i = 0; i < tabs.length; i++) {
        tabs[i].textContent = puzzle[i][0];
    }

    SetCurrentNumber(0);
}

function SetCurrentNumber(num) {
    //if num is too high, loop back around, and regardless just check if it's already solved. if we find they are ALL already solved, then we are done.
    currentNumber = num;
    
    tabs.forEach(tab => {
        tab.classList.remove("selected");
    });
    tabs[num].classList.add("selected");

    document.querySelector("#gamearea h2").textContent = puzzle[num][0];
    for(var i = 0; i < operands.length; i++) {
        operands[i].classList.remove("selected");
        if(puzzle[num][i + 1] == 0) {
            operands[i].classList.add("empty");
        } else {
            operands[i].classList.remove("empty");
            operandSpans[i].textContent = puzzle[num][i + 1];
        }
    }
}

function ClickOperand(index) {
    //do nothing if we've already solved
    for(var i = 1; i < puzzle[currentNumber].length; i++) {
        if(puzzle[currentNumber][i] == puzzle[currentNumber][0]) {
            return;
        }
    }

    if(selectedOperator >= 0) {
        var result = 0;
        if(selectedOperator == 1) { result = puzzle[currentNumber][selectedOperand + 1] + puzzle[currentNumber][index + 1]; }
        else if(selectedOperator == 2) { result = puzzle[currentNumber][selectedOperand + 1] - puzzle[currentNumber][index + 1]; }
        else if(selectedOperator == 3) { result = puzzle[currentNumber][selectedOperand + 1] * puzzle[currentNumber][index + 1]; }
        else if(selectedOperator == 4) { result = puzzle[currentNumber][selectedOperand + 1] / puzzle[currentNumber][index + 1]; }

        if((selectedOperator == 2 && result <= 0) || 
            (selectedOperator == 4 && puzzle[currentNumber][selectedOperand + 1] % puzzle[currentNumber][index + 1] != 0)) {
                //then we failed a subtract or divide
        }
        else {
            operandStates[currentNumber].push(puzzle[currentNumber].slice(0));

            puzzle[currentNumber][selectedOperand + 1] = 0;
            operands[selectedOperand].classList.add("empty");
            
            puzzle[currentNumber][index + 1] = result;
            operandSpans[index].textContent = result;
        }

        operators[selectedOperator].classList.remove("selected");
        operands[selectedOperand].classList.remove("selected");
        selectedOperator = -1;
        selectedOperand = -1;

        for(var i = 1; i < puzzle[currentNumber].length; i++) {
            if(puzzle[currentNumber][i] == puzzle[currentNumber][0]) {
                SetCurrentNumber(currentNumber + 1);
                return;
            }
        }
    } else if(selectedOperand == index) {
        operands[index].classList.remove("selected");
        selectedOperand = -1;
    }
    else {
        selectedOperand = index;
        for(var i = 0; i < operands.length; i++) {
            if(selectedOperand == i) {
                operands[i].classList.add("selected");
            } else {
                operands[i].classList.remove("selected");
            }
        }
    }
}

function ClickOperator(index) {
    if(index > 0) {
        //do nothing if we've already solved
        for(var i = 1; i < puzzle[currentNumber].length; i++) {
            if(puzzle[currentNumber][i] == puzzle[currentNumber][0]) {
                return;
            }
        }
        if(selectedOperand >= 0) {
            if(selectedOperator == index) {
                operators[index].classList.remove("selected");
                selectedOperator = -1;
            } else {
                selectedOperator = index;
                for(var i = 1; i < operators.length; i++) {
                    if(selectedOperator == i) {
                        operators[i].classList.add("selected");
                    } else {
                        operators[i].classList.remove("selected");
                    }
                }
            }
        }
    } else {
        //undo

        //bail if we have no saved states
        if(operandStates[currentNumber].length < 1) {
            return;
        }

        puzzle[currentNumber] = operandStates[currentNumber][operandStates[currentNumber].length - 1];

        for(var i = 0; i < operands.length; i++) {
            operands[i].classList.remove("selected");
            if(puzzle[currentNumber][i + 1] == 0) {
                operands[i].classList.add("empty");
            } else {
                operands[i].classList.remove("empty");
                operandSpans[i].textContent = puzzle[currentNumber][i + 1];
            }
        }

        operandStates[currentNumber].splice(operandStates[currentNumber].length - 1, 1);
    }
}

Load();