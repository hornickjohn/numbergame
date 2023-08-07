var puzzle = [[0],[0],[0],[0],[0]];

var currentNumber = 0;

var operandStates = [];
for(var i = 0; i < puzzle.length; i++) {
    operandStates.push([]);
}
var solutionOutputs = [];
for(var i = 0; i < puzzle.length; i++) {
    solutionOutputs.push([]);
}

var selectedOperand = -1;
var selectedOperator = -1;

var tabs = document.querySelectorAll("#tabs button");
var operators = document.querySelectorAll("#operators div");
var operands = document.querySelectorAll("#operands div");
var operandSpans = document.querySelectorAll("#operands div span");

async function Load() {
    var date = localStorage.getItem('jh_digits_date');
    var loaded = false;

    //get local day
    var offset = new Date().getTimezoneOffset() * 60000;
    var day = Math.floor((Date.now() - offset) / 86400000.0);

    if(date) {
        if(date == day) {
            //same day as saved
            puzzle = JSON.parse(localStorage.getItem('jh_digits_puzzle'));
            operandStates = JSON.parse(localStorage.getItem('jh_digits_operandStates'));
            solutionOutputs = JSON.parse(localStorage.getItem('jh_digits_solutionOutputs'));
            loaded = true;
        }
    }
    if(!loaded) {
        var success = false;
        await fetch('https://jhdigitsnode.azurewebsites.net/puzzle/' + day).then(response=>response.json()).then(data=>{ 
            if(data) {
                //convert data.puzzle string to actual puzzle data in the array, and maybe console log the minimum op data
                var indpuzz = data.puzzle.split('`');
                for(var i = 0; i < indpuzz.length; i++) {
                    var pieces = indpuzz[i].split('@');
                    puzzle[i][0] = Number(pieces[0]);
                    pieces[2].split('#').forEach(operand => {
                        puzzle[i].push(Number(operand));
                    });
                    console.log(puzzle[i][0] + " - Minimum Operations: " + pieces[1]);
                }

                localStorage.setItem('jh_digits_puzzle', JSON.stringify(puzzle));
                localStorage.setItem("jh_digits_number", data.number);
                localStorage.setItem('jh_digits_operandStates', JSON.stringify(operandStates));
                localStorage.setItem('jh_digits_solutionOutputs', JSON.stringify(solutionOutputs));
                localStorage.setItem('jh_digits_date', day);

                success = true;
            }
        }).catch(err=>{

        });

        if(!success) {
            localStorage.removeItem('jh_digits_operandStates');
            localStorage.removeItem('jh_digits_solutionOutputs');
            localStorage.removeItem('jh_digits_date');
            localStorage.removeItem('jh_digits_number');
            localStorage.removeItem('jh_digits_puzzle');

            document.querySelector('#errormessage').classList.remove('hidden');
            document.querySelector('#errormessage').textContent = "Error Loading Puzzle. Sorry.";
            document.querySelector('#content').classList.add('hidden');

            return;
        }
    }

    document.querySelector('#errormessage').classList.add('hidden');
    document.querySelector('#content').classList.remove('hidden');

    for(var i = 0; i < tabs.length; i++) {
        tabs[i].textContent = puzzle[i][0];
    }

    SetCurrentNumber(0, false);
}

function CopySolutions() {
    var copystr = "Digits #" + localStorage.getItem("jh_digits_number");
    for(var m = 0; m < solutionOutputs.length; m++) {
        copystr += "\n" + puzzle[m][0];
        copystr += "  ";
        if(m == 0) { copystr +=  " "; }
        for(var n = 0; n < solutionOutputs[m].length; n++) {
            if(solutionOutputs[m][n].includes("÷")) { copystr += "➗"; }
            else if(solutionOutputs[m][n].includes("×")) { copystr += "✖️"; }
            else if(solutionOutputs[m][n].includes("−")) { copystr += "➖"; }
            else if(solutionOutputs[m][n].includes("+")) { copystr += "➕"; }
        }
    }
    navigator.clipboard.writeText(copystr);

    document.querySelector('#popup').classList.add('hidden');
}

function SetCurrentNumber(num, manual) {
    //if num is too high, loop back around, and regardless just check if it's already solved. if we find they are ALL already solved, then we are done.
    

    if(!manual) {
        var done = true;
        for(var i = 0; i < 5; i++) {
            var puzz = (num + i) % 5;
            var solved = false;
            for(var j = 1; j < puzzle[puzz].length; j++) {
                if(puzzle[puzz][j] == puzzle[puzz][0]) {
                    solved = true;
                    break;
                }
            }
            if(!solved) {
                done = false;
                currentNumber = puzz;
                num = puzz;
                break;
            }
        }
        if(done) {
            //WE ARE DONE WITH ENTIRE PUZZLE GRATS
            document.querySelector('#popup').classList.remove('hidden');
        }
    }
    
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

    UpdateSolution();
}

function ClickOperand(index) {
    //do nothing if we've already solved
    for(var i = 1; i < puzzle[currentNumber].length; i++) {
        if(puzzle[currentNumber][i] == puzzle[currentNumber][0]) {
            return;
        }
    }

    if(selectedOperator >= 0) {
        //cancel everything if we're trying to operate on ourself
        if(index == selectedOperand) {
            operators[selectedOperator].classList.remove("selected");
            operands[selectedOperand].classList.remove("selected");
            selectedOperator = -1;
            selectedOperand = -1;
            return;
        }

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

            var soloutstr = "";
            soloutstr += puzzle[currentNumber][selectedOperand + 1] + " ";
            if(selectedOperator == 1) { soloutstr += "+ "; }
            else if(selectedOperator == 2) { soloutstr += "− "; }
            else if(selectedOperator == 3) { soloutstr += "× "; }
            else if(selectedOperator == 4) { soloutstr += "÷ "; }
            soloutstr += puzzle[currentNumber][index + 1];
            solutionOutputs[currentNumber].push(soloutstr);

            UpdateSolution();

            puzzle[currentNumber][selectedOperand + 1] = 0;
            operands[selectedOperand].classList.add("empty");
            
            puzzle[currentNumber][index + 1] = result;
            operandSpans[index].textContent = result;

            localStorage.setItem('jh_digits_puzzle', JSON.stringify(puzzle));
            localStorage.setItem('jh_digits_operandStates', JSON.stringify(operandStates));
            localStorage.setItem('jh_digits_solutionOutputs', JSON.stringify(solutionOutputs));
        }

        operators[selectedOperator].classList.remove("selected");
        operands[selectedOperand].classList.remove("selected");
        selectedOperator = -1;
        selectedOperand = -1;

        for(var i = 1; i < puzzle[currentNumber].length; i++) {
            if(puzzle[currentNumber][i] == puzzle[currentNumber][0]) {
                SetCurrentNumber(currentNumber + 1, false);
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
        solutionOutputs[currentNumber].splice(solutionOutputs[currentNumber].length - 1, 1);

        localStorage.setItem('jh_digits_puzzle', JSON.stringify(puzzle));
        localStorage.setItem('jh_digits_operandStates', JSON.stringify(operandStates));
        localStorage.setItem('jh_digits_solutionOutputs', JSON.stringify(solutionOutputs));

        UpdateSolution();
    }
}

function UpdateSolution() {
    var outp = "Solution:";
    solutionOutputs[currentNumber].forEach(sol => {
        outp += "<br>" + sol;
    });
    document.querySelector("#solution").innerHTML = outp;
}

Load();