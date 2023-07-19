var currentNumber = 0;

var tabs = document.querySelectorAll("#tabs button");
var operands = document.querySelectorAll("#operands div");

for(var i = 0; i < tabs.length; i++) {
    tabs[i].textContent = puzzle[i][0];
}

function SetCurrentNumber(num) {
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
            operands[i].textContent = puzzle[num][i + 1];
        }
    }
}