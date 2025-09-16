# Neon Tic-Tac-Toe (Multiplayer WebSocket Game)

This is a real-time multiplayer Tic-Tac-Toe game built with Node.js (Express & WebSocket) for the backend and a modern HTML/CSS/JavaScript frontend. It features a neon-themed UI, sound effects, and responsive design.

## Features

*   **Multiplayer:** Play against another player in real-time via WebSockets.
*   **Neon UI:** Stylish and animated user interface with dark mode.
*   **Sound Effects:** Engaging sound feedback for game actions.
*   **Responsive Design:** Playable on various devices (desktops, tablets, mobiles).
*   **Player Naming:** Players can enter their names before starting the game.
*   **Game State Synchronization:** Real-time updates of the game board and status for all connected players.

## How to Use

### 1. Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js**: [Download & Install Node.js](https://nodejs.org/en/download/) (LTS version recommended)

### 2. Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd tictactoe-ws
    ```
    (Note: Replace `<repository_url>` with the actual URL if this were a real repository.)

2.  **Install dependencies:**
    Navigate to the project root directory (`tictactoe-ws`) and install the necessary Node.js packages:
    ```bash
    npm install
    ```

### 3. Running the Game

1.  **Start the server:**
    From the project root directory, run the server:
    ```bash
    node server.js
    ```
    You should see output similar to:
    ```
    Server running on http://localhost:3000
    ```

2.  **Access the game:**
    Open your web browser and navigate to:
    ```
    http://localhost:3000
    ```
    You will be prompted to enter your name.

3.  **Play with a friend:**
    To play a multiplayer game, have a second player open the same URL (`http://localhost:3000`) in another browser tab or on another device connected to the same network. Once two players are connected and have entered their names, the game will begin automatically.

### 4. Gameplay

*   **Turns:** Players take turns clicking on empty cells to place their 'X' or 'O'.
*   **Winning:** The first player to get three of their marks in a row (horizontally, vertically, or diagonally) wins the round.
*   **Draw:** If all cells are filled and no player has won, the round is a draw.
*   **Reset/New Round:**
    *   The "Reset" button clears the board and starts a new round with the same players.
    *   The "New Round" button also clears the board and starts a new round.
*   **Settings:** The "Settings" button allows you to toggle sound effects and dark mode. (Note: Game mode and AI difficulty settings are not applicable in this multiplayer WebSocket version as the game is always Player vs Player).

### 5. Project Structure

*   `server.js`: The Node.js backend, handling WebSocket connections and game logic.
*   `client/`: Contains all frontend assets.
    *   `client/index.html`: The main HTML file for the game interface.
    *   `client/css/`: Stylesheets for the game, including animations and neon themes.
    *   `client/js/`: JavaScript files for client-side logic, UI updates, and effects.
    *   `client/assets/sounds/`: Sound effects used in the game.

## Technologies Used

*   **Backend:** Node.js, Express, WebSocket (ws)
*   **Frontend:** HTML5, CSS3 (Tailwind CSS, Bootstrap 5), JavaScript (jQuery, GSAP)
*   **Icons:** Font Awesome, Boxicons
*   **Fonts:** Google Fonts (Orbitron, Press Start 2P)

Enjoy playing Neon Tic-Tac-Toe!
