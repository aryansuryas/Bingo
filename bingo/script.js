/**
 * Bingo Game Logic with Bot Hiding Mechanics
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
    [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24],
    // Columns
    [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24],
    // Diagonals
    [0,6,12,18,24], [4,8,12,16,20]
];

// DOM Elements
const playerGridEl = document.getElementById('player-grid');
const botGridEl = document.getElementById('bot-grid');
const playerLinesEl = document.querySelector('#player-lines .count');
const botLinesEl = document.querySelector('#bot-lines .count');
const statusEl = document.getElementById('game-status');
const overlayEl = document.getElementById('game-over-overlay');
const winnerTextEl = document.getElementById('winner-text');
const winnerSubheadEl = document.getElementById('winner-subhead');
const restartBtn = document.getElementById('restart-btn');

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
        
        // Slightly random thinking time for realism
        setTimeout(botTurn, 1000 + Math.random() * 800);
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
            
            // If it's a bot cell, reveal it since it's now marked (called out)
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
        const isComplete = combo.every(index => markedNumbers.has(boardArray[index]));
        if (isComplete) {
            lines++;
            completedCombos.push(combo);
        }
    });
    
    return { lines, completedCombos };
}

function highlightLines(gridEl, completedCombos) {
    const cells = gridEl.querySelectorAll('.cell');
    completedCombos.forEach(combo => {
        combo.forEach(index => {
            const cell = cells[index];
            if (!cell.classList.contains('bingo-line')) {
                cell.classList.add('bingo-line');
            }
        });
    });
}

function updateScoreUI() {
    playerLinesEl.textContent = playerLinesCount;
    botLinesEl.textContent = botLinesCount;
}

function updateStatusUI() {
    if (isGameOver) return;
    
    if (isPlayerTurn) {
        statusEl.textContent = "Your Turn";
        statusEl.className = "status-bar player-turn";
    } else {
        statusEl.textContent = "AI Thinking...";
        statusEl.className = "status-bar bot-turn";
    }
}

function endGame(winner) {
    isGameOver = true;
    statusEl.textContent = "Game Over";
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
            winnerTextEl.classList.add('player-win');
            winnerSubheadEl.textContent = "Spectacular Bingo!";
        } else if (winner === 'bot') {
            winnerTextEl.textContent = "Bot Wins";
            winnerTextEl.classList.add('bot-win');
            winnerSubheadEl.textContent = "AI Dominance.";
        } else {
            winnerTextEl.textContent = "It's a Draw!";
            winnerTextEl.classList.add('draw');
            winnerSubheadEl.textContent = "A Rare Tie!";
        }
    }, 1500); // Give user time to see the final revealed board before the modal covers it
}

restartBtn.addEventListener('click', initGame);

// Start game initially
initGame();
