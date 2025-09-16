/* js/main.js */

// Global settings object
window.gameSettings = loadSettings();

let ws; // WebSocket connection

document.addEventListener('DOMContentLoaded', () => {
    // Hide preloader once everything is loaded
    hidePreloader();

    // Setup Dark Mode Toggle
    setupDarkModeToggle();

    // Initialize Settings Modal
    initSettingsModal(window.gameSettings);

    // Event Listeners for Game Controls
    document.getElementById('resetBtn').addEventListener('click', () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'reset_game' }));
            playSound('assets/sounds/reset.mp3');
        }
    });

    document.getElementById('newGameBtn').addEventListener('click', () => {
        // In multiplayer, "new round" is essentially a reset
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'reset_game' }));
            playSound('assets/sounds/new_game.mp3');
        }
    });

    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
        const newSettings = getModalSettings();
        window.gameSettings = { ...window.gameSettings, ...newSettings };
        saveSettings(window.gameSettings);
        // In multiplayer, settings like gameMode/aiDifficulty are not directly applicable
        // but sound effects and dark mode still are.
        // Close modal
        const settingsModal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
        if (settingsModal) settingsModal.hide();
    });

    // Establish WebSocket connection
    connectWebSocket();
});

function connectWebSocket() {
    ws = new WebSocket(`ws://${window.location.host}`);

    ws.onopen = () => {
        console.log('Connected to WebSocket server');
        // Prompt for name immediately after connection
        showNameInputModal();
    };

    ws.onmessage = event => {
        const data = JSON.parse(event.data);
        console.log('Received from server:', data);

        switch (data.type) {
            case 'player_assigned':
                // This is the initial assignment of X or O
                playerSymbol = data.symbol; // Store player's symbol globally or in game state
                updateStatus(`You are Player ${playerSymbol}. ${data.message}`, playerSymbol === 'X' ? 'text-red-500' : 'text-blue-500');
                break;
            case 'name_registered':
                // Name registered, hide modal
                hideNameInputModal();
                break;
            case 'game_state':
                // Update UI with new game state
                updateGameUI(data.board, data.currentPlayer, data.gameActive, data.message, data.winCombo, data.winner, data.draw, data.players, data.lastMoveIndex, data.lastMovePlayer);
                break;
            case 'opponent_disconnected':
                updateStatus(data.message, 'text-orange-500');
                // Optionally reset board or disable interaction
                clearBoardUI();
                break;
            case 'error':
                updateStatus(data.message, 'text-red-500');
                break;
            default:
                console.warn('Unknown message type:', data.type);
        }
    };

    ws.onclose = () => {
        console.log('Disconnected from WebSocket server. Attempting to reconnect...');
        updateStatus('Disconnected from server. Reconnecting...', 'text-red-500');
        setTimeout(connectWebSocket, 3000); // Attempt to reconnect after 3 seconds
    };

    ws.onerror = error => {
        console.error('WebSocket error:', error);
        updateStatus('WebSocket error. Check console.', 'text-red-500');
    };
}

// Global variable to store the player's assigned symbol
let playerSymbol = '';

// Function to send a move to the server
function sendMove(index) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'make_move', index }));
    }
}

