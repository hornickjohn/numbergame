var puzzle = [];

function GeneratePuzzle() {
    puzzle[0] = [Math.floor(51 + Math.random() * 49)];
    puzzle[1] = [Math.floor(101 + Math.random() * 99)];
    puzzle[2] = [Math.floor(201 + Math.random() * 99)];
    puzzle[3] = [Math.floor(301 + Math.random() * 99)];
    puzzle[4] = [Math.floor(401 + Math.random() * 99)];
    
    for(var i = 0; i < puzzle.length; i++) {
        var operands;
        var found = false;
        while(!found) {
            operands = [];
            while(operands.length < 6) {
                var temp = Math.floor(1 + Math.random() * 25);
                if(!operands.includes(temp)) {
                    operands.push(temp);
                }
            }

            var skip = false;
            for(var a = 0; a < operands.length - 1; a++) {
                for(var b = a + 1; b < operands.length; b++) {
                    if(operands[a] * operands[b] == puzzle[i][0]) {
                        skip = true;
                        break;
                    }
                }
            }

            if(!skip) {
                var results = [0,0,0,0,0,0]; //index 0 is total number of solutions, index 1 is total that ended in multiplication, index 2-5 are number of solutions that took that many ops
                RecursiveSolve(operands, puzzle[i][0], false, results);

                console.log(puzzle[i][0], results);

                if(results[1] > 0) {
                    found = true;
                }
            }
        }
        operands.sort((a, b) => a - b);
        puzzle[i].push(...operands);
    }
}

function RecursiveSolve(operands, target, mult, results) {
    for(var i = 0; i < operands.length; i++) {
        if(operands[i] == target) {
            if(mult) {
                results[0]++;
            }
            results[6 - operands.length]++;
            results[1]++;
    
            return;    
        }
    }
    
    if(operands.length <= 1) {
        return;
    }

    for(var i = 0; i < operands.length - 1; i++) {
        for(var j = i + 1; j < operands.length; j++) {
            var newVal = operands[i] + operands[j];
            var newOperands = CopyAllButIndices(operands, i, j);
            newOperands.push(newVal);
            RecursiveSolve(newOperands, target, false, results);

            newVal = operands[i] * operands[j];
            newOperands = CopyAllButIndices(operands, i, j);
            newOperands.push(newVal);
            RecursiveSolve(newOperands, target, true, results);

            if(operands[i] % operands[j] == 0) {
                newVal = operands[i] / operands[j];
                newOperands = CopyAllButIndices(operands, i, j);
                newOperands.push(newVal);
                RecursiveSolve(newOperands, target, true, results);
            }
            if(operands[j] % operands[i] == 0) {
                newVal = operands[j] / operands[i];
                newOperands = CopyAllButIndices(operands, i, j);
                newOperands.push(newVal);
                RecursiveSolve(newOperands, target, true, results);
            }

            if(operands[i] - operands[j] > 0) {
                newVal = operands[i] - operands[j];
                newOperands = CopyAllButIndices(operands, i, j);
                newOperands.push(newVal);
                RecursiveSolve(newOperands, target, false, results);
            }
            if(operands[j] - operands[i] > 0) {
                newVal = operands[j] - operands[i];
                newOperands = CopyAllButIndices(operands, i, j);
                newOperands.push(newVal);
                RecursiveSolve(newOperands, target, false, results);
            }
        }
    }
}

function CopyAllButIndices(arr, a, b) {
    var newArray = [];
    for(var k = 0; k < arr.length; k++) {
        if(k !== a && k !== b) {
            newArray.push(arr[k]);
        }
    }
    return newArray;
}

GeneratePuzzle();