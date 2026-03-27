/**
 * Notebook Bingo Game Logic with Bot Hiding Mechanics
 */

let playerBoard = [];
let botBoard = [];
let markedNumbers = new Set();
let isPlayerTurn = true;
let isGameOver = false;

let playerLinesCount = 0;
let botLinesCount = 0;

const winningCombinations = [
    // Rows
    { type: 'horizontal', indices: [0,1,2,3,4] }, { type: 'horizontal', indices: [5,6,7,8,9] }, { type: 'horizontal', indices: [10,11,12,13,14] }, { type: 'horizontal', indices: [15,16,17,18,19] }, { type: 'horizontal', indices: [20,21,22,23,24] },
    // Columns
    { type: 'vertical', indices: [0,5,10,15,20] }, { type: 'vertical', indices: [1,6,11,16,21] }, { type: 'vertical', indices: [2,7,12,17,22] }, { type: 'vertical', indices: [3,8,13,18,23] }, { type: 'vertical', indices: [4,9,14,19,24] },
    // Diagonals
    { type: 'diagonal-main', indices: [0,6,12,18,24] }, { type: 'diagonal-anti', indices: [4,8,12,16,20] }
];

// DOM Elements
const playerGridEl = document.getElementById('player-grid');
const botGridEl = document.getElementById('bot-grid');
const playerLinesEl = document.getElementById('player-lines');
const botLinesEl = document.getElementById('bot-lines');
const statusEl = document.getElementById('game-status');
const overlayEl = document.getElementById('game-over-overlay');
const winnerTextEl = document.getElementById('winner-text');
const winnerSubheadEl = document.getElementById('winner-subhead');
const restartBtn = document.getElementById('restart-btn');

const welcomeOverlay = document.getElementById('welcome-overlay');
const playerNameInput = document.getElementById('player-name-input');
const startGameBtn = document.getElementById('start-game-btn');
const playerNameDisplay = document.getElementById('player-name-display');

let playerName = "You";

startGameBtn.addEventListener('click', () => {
    const inputVal = playerNameInput.value.trim();
    if (inputVal) {
        playerName = inputVal;
    } else {
        playerName = "Player";
    }
    playerNameDisplay.textContent = playerName;
    welcomeOverlay.classList.add('hidden');
    initGame();
});

function initGame() {
    isGameOver = false;
    isPlayerTurn = true;
    markedNumbers.clear();
    playerLinesCount = 0;
    botLinesCount = 0;
    
    playerBoard = generateRandomBoard();
    botBoard = generateRandomBoard();
    
    renderBoard(playerGridEl, playerBoard, 'player');
    renderBoard(botGridEl, botBoard, 'bot');
    
    updateScoreUI();
    updateStatusUI();
    
    overlayEl.classList.add('hidden');
    winnerTextEl.className = '';
}

function generateRandomBoard() {
    let nums = Array.from({length: 25}, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    return nums;
}

function renderBoard(gridEl, boardArray, type) {
    gridEl.innerHTML = '';
    boardArray.forEach((number, index) => {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        
        // Hide Bot's numbers based on user feedback
        if (type === 'bot') {
            cell.classList.add('hidden-number');
            // The number is not set as textContent until it's revealed
        } else {
            cell.textContent = number;
        }
        
        cell.dataset.number = number;
        cell.dataset.index = index;
        cell.dataset.owner = type;
        
        if (type === 'player') {
            cell.addEventListener('click', () => handlePlayerClick(number));
        }
        
        gridEl.appendChild(cell);
    });
}

function handlePlayerClick(number) {
    if (isGameOver || !isPlayerTurn || markedNumbers.has(number)) {
        return;
    }
    
    processTurn(number);
    
    if (!isGameOver) {
        isPlayerTurn = false;
        updateStatusUI();
        
        // Simulate thinking time (bot is pretending to scan its paper board!)
        setTimeout(botTurn, 800 + Math.random() * 600);
    }
}

function botTurn() {
    if (isGameOver) return;
    
    const availableBotNumbers = botBoard.filter(n => !markedNumbers.has(n));
    if (availableBotNumbers.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableBotNumbers.length);
        const selectedNumber = availableBotNumbers[randomIndex];
        processTurn(selectedNumber);
    }
    
    if (!isGameOver) {
        isPlayerTurn = true;
        updateStatusUI();
    }
}

function processTurn(number) {
    markedNumbers.add(number);
    
    // Update UI for both boards
    markCellUI(playerGridEl, number);
    markCellUI(botGridEl, number);
    
    // Check lines
    const playerWinInfo = checkLines(playerBoard);
    const botWinInfo = checkLines(botBoard);
    
    playerLinesCount = playerWinInfo.lines;
    botLinesCount = botWinInfo.lines;
    updateScoreUI();
    
    // Highlight lines that just got completed
    highlightLines(playerGridEl, playerWinInfo.completedCombos);
    highlightLines(botGridEl, botWinInfo.completedCombos);
    
    // Win conditions
    if (playerLinesCount >= 5 && botLinesCount >= 5) {
        endGame('draw');
    } else if (playerLinesCount >= 5) {
        endGame('player');
    } else if (botLinesCount >= 5) {
        endGame('bot');
    }
}

function markCellUI(gridEl, number) {
    const cells = gridEl.querySelectorAll('.cell');
    cells.forEach(cell => {
        if (parseInt(cell.dataset.number, 10) === number && !cell.classList.contains('marked')) {
            cell.classList.add('marked');
            
            // If it's a bot cell, reveal it since it's now marked
            if (cell.dataset.owner === 'bot' && cell.classList.contains('hidden-number')) {
                cell.textContent = number;
                cell.classList.remove('hidden-number');
            }
        }
    });
}

function checkLines(boardArray) {
    let lines = 0;
    let completedCombos = [];
    
    winningCombinations.forEach((combo) => {
        const isComplete = combo.indices.every(index => markedNumbers.has(boardArray[index]));
        if (isComplete) {
            lines++;
            completedCombos.push(combo);
        }
    });
    
    return { lines, completedCombos };
}

function highlightLines(gridEl, completedCombos) {
    const cells = gridEl.querySelectorAll('.cell');
    
    // Clear old lines before redrawing
    cells.forEach(cell => {
        const existingLines = cell.querySelectorAll('.strike-line');
        existingLines.forEach(l => l.remove());
    });

    completedCombos.forEach(combo => {
        combo.indices.forEach(index => {
            const cell = cells[index];
            const line = document.createElement('div');
            line.classList.add('strike-line', 'strike-' + combo.type);
            cell.appendChild(line);
        });
    });
}

function formatBingoWord(count) {
    const word = "BINGO";
    const letters = word.substring(0, Math.min(count, 5));
    const blanks = "_".repeat(5 - Math.min(count, 5));
    return (letters + blanks).split('').join(' ');
}

function updateScoreUI() {
    playerLinesEl.textContent = formatBingoWord(playerLinesCount);
    botLinesEl.textContent = formatBingoWord(botLinesCount);
}

function updateStatusUI() {
    if (isGameOver) return;
    
    if (isPlayerTurn) {
        statusEl.textContent = "Your Turn!";
        statusEl.className = "status-bar player-turn";
    } else {
        statusEl.textContent = "Bot is thinking...";
        statusEl.className = "status-bar bot-turn";
    }
}

function endGame(winner) {
    isGameOver = true;
    statusEl.textContent = "Game Over!";
    statusEl.className = "status-bar";
    
    // Reveal all remaining bot numbers for analysis
    const botCells = botGridEl.querySelectorAll('.cell');
    botCells.forEach(cell => {
        if (cell.classList.contains('hidden-number')) {
            cell.textContent = cell.dataset.number;
            cell.classList.remove('hidden-number');
            cell.classList.add('revealed-end');
        }
    });
    
    setTimeout(() => {
        overlayEl.classList.remove('hidden');
        
        if (winner === 'player') {
            winnerTextEl.textContent = "You Win!";
            winnerTextEl.classList.remove('bot-win', 'draw');
            winnerTextEl.classList.add('player-win');
            winnerSubheadEl.textContent = playerName + ", you totally scribbled them out!";
        } else if (winner === 'bot') {
            winnerTextEl.textContent = "Bot Wins!";
            winnerTextEl.classList.remove('player-win', 'draw');
            winnerTextEl.classList.add('bot-win');
            winnerSubheadEl.textContent = "Outsmarted by a doodle AI.";
        } else {
            winnerTextEl.textContent = "Draw!";
            winnerTextEl.classList.remove('player-win', 'bot-win');
            winnerTextEl.classList.add('draw');
            winnerSubheadEl.textContent = "A perfect tie!";
        }
    }, 1200);
}

restartBtn.addEventListener('click', initGame);

// Note: Initial game starts after name modal is submitted.
