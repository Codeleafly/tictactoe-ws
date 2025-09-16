const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// Serve static files from the 'client' directory
app.use(express.static(path.join(__dirname, 'client')));

// Store active games and connected clients
const games = new Map(); // Map<gameId, { players: Map<ws, { name: string, playerSymbol: string }>, board: Array<string>, currentPlayer: string, gameActive: boolean, winCombo: Array<number> }>
let nextGameId = 1;

wss.on('connection', ws => {
    console.log('Client connected');

    let player = { ws, name: '', playerSymbol: '' };
    let gameId = null;

    // Find or create a game
    for (let [id, game] of games) {
        if (game.players.size < 2) {
            gameId = id;
            break;
        }
    }

    if (!gameId) {
        gameId = `game-${nextGameId++}`;
        games.set(gameId, {
            players: new Map(),
            board: Array(9).fill(''),
            currentPlayer: 'X',
            gameActive: false, // Game starts when 2 players join
            winCombo: null
        });
        console.log(`Created new game: ${gameId}`);
    }

    const game = games.get(gameId);
    game.players.set(ws, player);

    if (game.players.size === 1) {
        player.playerSymbol = 'X';
        ws.send(JSON.stringify({ type: 'player_assigned', symbol: 'X', message: 'Waiting for another player...' }));
    } else if (game.players.size === 2) {
        player.playerSymbol = 'O';
        game.gameActive = true;
        // Notify both players that the game can start
        game.players.forEach((p, clientWs) => {
            clientWs.send(JSON.stringify({ type: 'player_assigned', symbol: p.playerSymbol, message: 'Game starting!' }));
            clientWs.send(JSON.stringify({ type: 'game_state', board: game.board, currentPlayer: game.currentPlayer, gameActive: game.gameActive, message: `Player ${game.currentPlayer}'s turn` }));
        });
        console.log(`Game ${gameId} started with 2 players.`);
    } else {
        // More than 2 players trying to join, this shouldn't happen with current logic but good to handle
        ws.send(JSON.stringify({ type: 'error', message: 'Game is full. Please try again later.' }));
        ws.close();
        return;
    }

    ws.on('message', message => {
        const data = JSON.parse(message);
        console.log(`Received message from ${player.playerSymbol} (${player.name}):`, data);

        if (data.type === 'register_name') {
            player.name = data.name;
            ws.send(JSON.stringify({ type: 'name_registered', name: player.name }));
            // If game is full, send initial state again with names
            if (game.players.size === 2) {
                game.players.forEach((p, clientWs) => {
                    clientWs.send(JSON.stringify({ type: 'game_state', board: game.board, currentPlayer: game.currentPlayer, gameActive: game.gameActive, message: `Player ${game.currentPlayer}'s turn`, players: Array.from(game.players.values()).map(pl => ({ name: pl.name, symbol: pl.playerSymbol })) }));
                });
            }
        } else if (data.type === 'make_move' && game.gameActive && player.playerSymbol === game.currentPlayer) {
            const { index } = data;

            if (game.board[index] === '') {
                game.board[index] = game.currentPlayer;

                if (checkWin(game.board, game.currentPlayer)) {
                    game.gameActive = false;
                    game.winCombo = getWinCombo(game.board, game.currentPlayer);
                    game.players.forEach((p, clientWs) => {
                        clientWs.send(JSON.stringify({ type: 'game_state', board: game.board, currentPlayer: game.currentPlayer, gameActive: game.gameActive, message: `Player ${game.currentPlayer} Wins!`, winCombo: game.winCombo, winner: game.currentPlayer }));
                    });
                    console.log(`Game ${gameId} - Player ${game.currentPlayer} wins!`);
                } else if (checkDraw(game.board)) {
                    game.gameActive = false;
                    game.players.forEach((p, clientWs) => {
                        clientWs.send(JSON.stringify({ type: 'game_state', board: game.board, currentPlayer: game.currentPlayer, gameActive: game.gameActive, message: "It's a Draw!", draw: true }));
                    });
                    console.log(`Game ${gameId} - Draw!`);
                } else {
                    const lastMovePlayer = game.currentPlayer;
                    game.currentPlayer = (game.currentPlayer === 'X' ? 'O' : 'X');
                    game.players.forEach((p, clientWs) => {
                        clientWs.send(JSON.stringify({ type: 'game_state', board: game.board, currentPlayer: game.currentPlayer, gameActive: game.gameActive, message: `Player ${game.currentPlayer}'s turn`, lastMoveIndex: index, lastMovePlayer: lastMovePlayer }));
                    });
                }
            }
        } else if (data.type === 'reset_game') {
            game.board = Array(9).fill('');
            game.currentPlayer = 'X';
            game.gameActive = game.players.size === 2; // Only active if 2 players
            game.winCombo = null;
            game.players.forEach((p, clientWs) => {
                clientWs.send(JSON.stringify({ type: 'game_state', board: game.board, currentPlayer: game.currentPlayer, gameActive: game.gameActive, message: `Game reset. Player ${game.currentPlayer}'s turn` }));
            });
            console.log(`Game ${gameId} reset.`);
        }
    });

    ws.on('close', () => {
        console.log(`Client ${player.playerSymbol} (${player.name}) disconnected from game ${gameId}`);
        if (game) {
            game.players.delete(ws);
            if (game.players.size === 0) {
                games.delete(gameId);
                console.log(`Game ${gameId} removed as all players disconnected.`);
            } else {
                // Notify remaining player that opponent disconnected
                game.gameActive = false; // Game cannot continue with one player
                game.players.forEach((p, clientWs) => {
                    clientWs.send(JSON.stringify({ type: 'opponent_disconnected', message: 'Your opponent disconnected. Waiting for a new player...' }));
                });
            }
        }
    });

    ws.on('error', error => {
        console.error('WebSocket error:', error);
    });
});

// Game logic helper functions (copied from client-side game.js, but adapted for server)
const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

function checkWin(board, player) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return board[index] === player;
        });
    });
}

function getWinCombo(board, player) {
    for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
        const combo = WINNING_COMBINATIONS[i];
        if (combo.every(index => board[index] === player)) {
            return combo;
        }
    }
    return null;
}

function checkDraw(board) {
    return board.every(cell => cell !== '');
}


server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
