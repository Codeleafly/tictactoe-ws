/* js/ui.js */

const gameBoardElement = document.getElementById('gameBoard');
const gameStatusElement = document.getElementById('gameStatus');
const scoreXElement = document.getElementById('scoreX');
const scoreOElement = document.getElementById('scoreO');

let nameInputModal; // Declare modal instance globally

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the name input modal
    nameInputModal = new bootstrap.Modal(document.getElementById('nameInputModal'), {
        backdrop: 'static', // Prevent closing by clicking outside
        keyboard: false // Prevent closing by escape key
    });

    document.getElementById('submitNameBtn').addEventListener('click', () => {
        const playerName = document.getElementById('playerNameInput').value.trim();
        if (playerName) {
            // Send name to server via WebSocket (defined in main.js)
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'register_name', name: playerName }));
            }
        } else {
            alert('Please enter your name!');
        }
    });
});

/**
 * Renders the Tic-Tac-Toe board based on the current game state.
 * @param {Array<string>} board - The current state of the board.
 * @param {boolean} gameActive - Whether the game is active.
 */
function renderBoard(board, gameActive) {
    gameBoardElement.innerHTML = ''; // Clear existing board
    board.forEach((cell, index) => {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell', 'flex', 'items-center', 'justify-center', 'text-5xl', 'font-bold', 'cursor-pointer', 'rounded-lg', 'shadow-neon-sm', 'hover:bg-gray-700', 'hover:text-purple-400', 'transition-all', 'duration-200');
        cellElement.dataset.index = index;
        if (cell === 'X') {
            cellElement.classList.add('x');
            cellElement.innerHTML = '<i class="fas fa-times"></i>';
        } else if (cell === 'O') {
            cellElement.classList.add('o');
            cellElement.innerHTML = '<i class="far fa-circle"></i>';
        }
        // Only add click listener if the game is active and it's the player's turn
        if (gameActive && playerSymbol === currentPlayer) { // currentPlayer is global from main.js
            cellElement.addEventListener('click', () => sendMove(index)); // sendMove is global from main.js
        }
        gameBoardElement.appendChild(cellElement);
    });
    animateBoardReset(gameBoardElement); // Animate cells appearing
}

/**
 * Updates the game status message.
 * @param {string} message - The message to display.
 * @param {string} colorClass - Tailwind CSS color class (e.g., 'text-green-500').
 */
function updateStatus(message, colorClass = '') {
    gameStatusElement.textContent = message;
    gameStatusElement.className = 'text-center text-3xl font-bold mt-8 mb-6 text-yellow-400 drop-shadow-neon-sm animate-pulse-fast font-press-start'; // Reset classes for neon theme
    if (colorClass) {
        gameStatusElement.classList.add(colorClass);
    }
    gsap.fromTo(gameStatusElement, 
        { opacity: 0, y: -10 }, 
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );
}

/**
 * Updates the scores displayed on the scoreboard.
 * @param {Array<object>} players - Array of player objects { name, symbol }.
 */
function updateScores(players) {
    const playerX = players.find(p => p.symbol === 'X');
    const playerO = players.find(p => p.symbol === 'O');

    scoreXElement.innerHTML = `<i class="fas fa-user mr-2 text-green-500"></i> ${playerX ? playerX.name : 'X'}: <span id="scoreXVal">0</span>`;
    scoreOElement.innerHTML = `<i class="fas fa-user mr-2 text-blue-500"></i> ${playerO ? playerO.name : 'O'}: <span id="scoreOVal">0</span>`;
    
    // Scores are not managed on client-side for multiplayer, so we just display names
    // If server sends scores, we would update scoreXVal and scoreOVal
}

/**
 * Highlights the winning cells.
 * @param {Array<number>} winCombo - Array of indices of the winning cells.
 */
function highlightWinningCells(winCombo) {
    animateWinningCellsBlink(gameBoardElement, winCombo);
}

/**
 * Clears the board and status for a new game.
 */
function clearBoardUI() {
    gameBoardElement.innerHTML = '';
    updateStatus('');
    // Stop any blinking animations on cells
    Array.from(gameBoardElement.children).forEach(cell => {
        gsap.killTweensOf(cell); // Stop GSAP animations
        cell.style.backgroundColor = ''; // Reset background color
        resetCellAnimation(cell);
    });
}

/**
 * Sets up the dark mode toggle functionality.
 */
function setupDarkModeToggle() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const htmlElement = document.documentElement;

    // Apply initial theme based on settings
    if (window.gameSettings.darkMode) {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }

    darkModeToggle.addEventListener('click', () => {
        htmlElement.classList.toggle('dark');
        const isDarkMode = htmlElement.classList.contains('dark');
        localStorage.setItem('darkMode', isDarkMode);
        window.gameSettings.darkMode = isDarkMode; // Update global settings
    });
}

/**
 * Initializes the settings modal with current game settings.
 * @param {object} settings - The current game settings.
 */
function initSettingsModal(settings) {
    // In multiplayer, gameMode and aiDifficulty are not relevant for the client
    // We only care about sound effects and dark mode
    document.getElementById('soundEffectsToggle').checked = settings.soundEffects;

    // Hide game mode and AI difficulty settings for multiplayer
    const gameModeContainer = document.getElementById('gameMode').closest('.mb-4');
    if (gameModeContainer) gameModeContainer.style.display = 'none';
    const aiDifficultyContainer = document.getElementById('aiDifficultyContainer');
    if (aiDifficultyContainer) aiDifficultyContainer.style.display = 'none';
}

/**
 * Gets the settings from the modal.
 * @returns {object} The settings from the modal.
 */
function getModalSettings() {
    return {
        // gameMode and aiDifficulty are not saved from client for multiplayer
        soundEffects: document.getElementById('soundEffectsToggle').checked
    };
}

/**
 * Shows the name input modal.
 */
function showNameInputModal() {
    nameInputModal.show();
}

/**
 * Hides the name input modal.
 */
function hideNameInputModal() {
    nameInputModal.hide();
}

// Global variable to store the current player (received from server)
let currentPlayer = '';

/**
 * Updates the entire game UI based on the game state received from the server.
 * @param {Array<string>} board - The current state of the board.
 * @param {string} serverCurrentPlayer - The player whose turn it is.
 * @param {boolean} gameActive - Whether the game is active.
 * @param {string} message - The status message to display.
 * @param {Array<number>} winCombo - The winning combination (if any).
 * @param {string} winner - The winner (if any).
 * @param {boolean} draw - True if it's a draw.
 * @param {Array<object>} players - Array of player objects { name, symbol }.
 * @param {number} lastMoveIndex - The index of the last move made.
 * @param {string} lastMovePlayer - The player who made the last move.
 */
function updateGameUI(board, serverCurrentPlayer, gameActive, message, winCombo, winner, draw, players, lastMoveIndex, lastMovePlayer) {
    currentPlayer = serverCurrentPlayer; // Update global current player

    // Update scores (player names)
    if (players) {
        updateScores(players);
    }

    // Render the board
    renderBoard(board, gameActive);

    // Animate the last move and play click sound
    if (lastMoveIndex !== undefined && lastMovePlayer) {
        const cellElement = gameBoardElement.children[lastMoveIndex];
        if (cellElement) {
            animateCellClick(cellElement, lastMovePlayer.toLowerCase());
        }
    }

    // Update status message
    let colorClass = '';
    if (winner) {
        colorClass = winner === 'X' ? 'text-red-500' : 'text-blue-500';
    } else if (draw) {
        colorClass = 'text-orange-500';
    } else if (gameActive) {
        colorClass = currentPlayer === 'X' ? 'text-red-500' : 'text-blue-500';
    }
    updateStatus(message, colorClass);

    // Highlight winning cells if there's a winner
    if (winCombo && winner) {
        highlightWinningCells(winCombo);
    }

    // Play sounds based on game state
    if (winner) {
        playSound('assets/sounds/win.mp3');
    } else if (draw) {
        playSound('assets/sounds/draw.mp3');
    }
}

