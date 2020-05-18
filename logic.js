const xClass = "x";
const oClass = "o";
const winCombinations = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
];

let againstBot = false;
let botTurn = false;
let xTurn = true;

let botSymbol;
let humanSymbol; //these 2 variables are for the minimax algorithm

const turnMessage = document.getElementById("turn-message");

const board = document.getElementById("board");
const cellElements = document.querySelectorAll('[data-cell]');
const endMessageText = document.getElementById("message-text");
const endScreen = document.getElementById("winning-message");
const restartButton = document.getElementById("new-game-button");

const startMenu = document.getElementById("start-menu");
const playAgainstIRLPlayerButton = document.getElementById("against-irl-player");
const playAgainstBotFirst = document.getElementById("against-bot-first");
const playAgainstBotSecond = document.getElementById("against-bot-second");

playAgainstIRLPlayerButton.addEventListener('click', () => {
    startMenu.classList.add("hide");
    againstBot = false;
    botTurn = false;
    botSymbol = null;
    humanSymbol = null;
    startGame();
});

playAgainstBotFirst.addEventListener('click', () => {
    startMenu.classList.add("hide");
    againstBot = true;
    botTurn = false;
    botSymbol = oClass;
    humanSymbol = xClass;
    startGame();
})

playAgainstBotSecond.addEventListener('click', () => {
    startMenu.classList.add("hide");
    againstBot = true;
    botTurn = true;
    botSymbol = xClass;
    humanSymbol = oClass;
    startGame();
})

restartButton.addEventListener('click', resetBoard);

function resetBoard() {
    endScreen.classList.remove("show");
    cellElements.forEach(cell => {
        cell.classList.remove(xClass);
        cell.classList.remove(oClass);
        cell.removeEventListener('click', onClick);
        
        
    });
    board.classList.remove(xClass);
    board.classList.remove(oClass);
    board.classList.add(xClass);
    startMenu.classList.remove("hide");
}

function endGame(draw) {
    //essentially turn the bot off
    botTurn = false;
    againstBot = false;
    
    if(draw) {
        endMessageText.innerText = `Draw! :-(`;

    } else {
        endMessageText.innerText = `${xTurn? "X" : "O"} Wins! :-)`;
    }
    endScreen.classList.add("show");
}

function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
}

function switchTurns() {
    xTurn = !xTurn;
    botTurn = !botTurn;
    
    if(xTurn) {
        board.classList.remove(oClass);
        board.classList.add(xClass);
    } else {
        board.classList.remove(xClass);
        board.classList.add(oClass);
    }
    turnMessage.innerText = `${xTurn? "X" : "O"}'s turn to move!`;

    if(againstBot && botTurn) {
        botMakeMove(); 
    }
}

function checkWin(currentClass) {
    //Use winCombinations to index out cells; if any of
    //those combinations have currentClass for all 3 cells,
    //then currentClass wins

    return winCombinations.some(comb => {
        return comb.every(index => {
            return cellElements[index].classList.contains(currentClass);
        });
    });
}

/*destructuring the array to get the every method*/
function checkDraw() {
    return [...cellElements].every(cell => {
        return cell.classList.contains(xClass) || cell.classList.contains(oClass);
    })
}


//logic for playing against another player
function startGame() {
    xTurn = true;
    turnMessage.innerText = `${xTurn? "X" : "O"}'s turn to move!`;
    cellElements.forEach(cell => {
        cell.addEventListener('click', onClick, {once: true})
    });
    if (againstBot && botTurn) {
        botMakeMove();
    }
}

function onClick(e) {
    let cell = e.target;
    let currentClass = xTurn? xClass : oClass;
    
    //place mark
    placeMark(cell, currentClass);
    
    //check game state
    if(checkWin(currentClass)) {
        endGame(false);
    } else if (checkDraw()) {
        endGame(true);
    } else {
    switchTurns();
    }
}

//logic for playing against the computer

function botMakeMove() {
    //create a duplicate board as an array to find the best index
    let copyBoard = [];

    cellElements.forEach(cell => {
        if (cell.classList.contains(xClass)) {
            copyBoard.push(xClass);
        } else if (cell.classList.contains(oClass)) {
            copyBoard.push(oClass); 
        } else {
            copyBoard.push("");
        }
    })

    let bestMoveIndex = getBestMove(copyBoard);
    cellElements[bestMoveIndex].click();
}

function getBestMove(board) {
    //bot is always the maximizing agent

    if(board[4] === "") return 4; //always take the center if it can


    let bestMoveScore = Number.MIN_SAFE_INTEGER;
    let bestMoveIndex;
    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = botSymbol; //if the bot goes here,
            let score = minimax(board, false); //the human player is predicted to force the move the bot just did to have this value
            board[i] = "";
            if(score > bestMoveScore) { //choose the move that the human can force to have a bad value the least
                bestMoveScore = score;
                bestMoveIndex = i;
            }
        }
    }
    return bestMoveIndex;
}


//algorithm for minimax function
function minimax(board, isMaximizing) {
    if (isMaximizing) {
        if(checkWinMinimax(board, humanSymbol)) { //human will win if bot lets him make this move. return -1
            return -1;
        } else if (checkDrawMinimax(board)) { //if its a tie, return 0
            return 0;
        } else {
            let bestMoveScore = Number.MIN_SAFE_INTEGER;
            for (let i = 0; i < 9; i++) {
                if (board[i] === "") {
                board[i] = botSymbol; //bot tries another move
                let score = minimax(board, false); //human forces that move to have a certain value (as low as possible)
                board[i] = "";
                bestMoveScore = Math.max(score, bestMoveScore); //bot chooses the best move it can
                }
            }    
            return bestMoveScore;   
        }
    } else {
        if (checkWinMinimax(board, botSymbol)) { //if making this move means the bot wins, return 1
            return 1;
        } else if (checkDrawMinimax(board)) { //if the bot calculates that this path is a tie, return 0
            return 0;
        } else {
            let bestMoveScore = Number.MAX_SAFE_INTEGER;
            for (let i = 0; i < 9; i++) {
                if (board[i] === "") {
                board[i] = humanSymbol; //human makes move
                let score = minimax(board, true); //bot forces the move to have this value
                board[i] = "";
                bestMoveScore = Math.min(score, bestMoveScore); //choose the least value bc minimizing player
                }
            }    
            return bestMoveScore
        }
    }
}

function checkWinMinimax(board, currentClass) {
    return winCombinations.some(combination => {
        return combination.every(index => {
            return board[index] === currentClass;
        })
    });
}

function checkDrawMinimax(board) {
    return board.every(element => {
        return element !== "";
    })
}
