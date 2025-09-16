/* js/effects.js */

/**
 * Animates a cell click.
 * @param {HTMLElement} cellElement - The clicked cell element.
 * @param {string} playerClass - 'x' or 'o'.
 */
function animateCellClick(cellElement, playerClass) {
    const symbol = playerClass === 'x' ? '<i class="fas fa-times"></i>' : '<i class="far fa-circle"></i>';
    cellElement.innerHTML = symbol;
    gsap.fromTo(cellElement.children[0], 
        { scale: 0, opacity: 0, rotate: -90 }, 
        { scale: 1, opacity: 1, rotate: 0, duration: 0.3, ease: "back.out(1.7)" }
    );
    playSound('assets/sounds/click.mp3'); // Assuming a click sound exists
}

/**
 * Animates the winning cells to blink with a green background.
 * @param {HTMLElement} gameBoardElement - The game board element.
 * @param {Array<number>} winCombo - The winning combination of cell indices.
 */
function animateWinningCellsBlink(gameBoardElement, winCombo) {
    winCombo.forEach(cellIndex => {
        const cell = gameBoardElement.children[cellIndex];
        if (cell) {
            gsap.to(cell, { 
                backgroundColor: "#10b981", // Green color
                repeat: -1, 
                yoyo: true, 
                duration: 0.5, 
                ease: "power1.inOut",
                overwrite: "auto"
            });
        }
    });
}

/**
 * Animates a draw scenario.
 */
function animateDraw() {
    gsap.to('#gameStatus', { 
        scale: 1.1, 
        color: '#f97316', // Orange
        duration: 0.5, 
        yoyo: true, 
        repeat: 1, 
        ease: "power1.inOut" 
    });
}

/**
 * Resets cell animations.
 * @param {HTMLElement} cellElement - The cell element to reset.
 */
function resetCellAnimation(cellElement) {
    gsap.to(cellElement, { scale: 1, duration: 0.2, backgroundColor: "" }); // Reset background color
    cellElement.classList.remove('winning-cell');
}

/**
 * Animates the preloader out.
 */
function hidePreloader() {
    gsap.to('#preloader', { 
        opacity: 0, 
        duration: 0.5, 
        onComplete: () => document.getElementById('preloader').style.display = 'none' 
    });
}

/**
 * Animates the game board on reset/new game.
 * @param {HTMLElement} gameBoardElement - The game board element.
 */
function animateBoardReset(gameBoardElement) {
    gsap.fromTo(gameBoardElement.children, 
        { opacity: 0, scale: 0.8 }, 
        { opacity: 1, scale: 1, duration: 0.3, stagger: 0.05, ease: "back.out(1.7)" }
    );
    // Ensure any win lines are removed (though animateWinningCellsBlink replaces it)
    const winLine = gameBoardElement.querySelector('.win-line');
    if (winLine) {
        gsap.to(winLine, { opacity: 0, duration: 0.3, onComplete: () => winLine.remove() });
    }
}

/**
 * Animates score update.
 * @param {string} scoreId - The ID of the score element (e.g., 'scoreX').
 * @param {number} newScore - The new score value.
 */
function animateScoreUpdate(scoreId, newScore) {
    const scoreElement = document.getElementById(scoreId);
    if (scoreElement) {
        gsap.fromTo(scoreElement, 
            { scale: 1.2, color: '#10b981' }, 
            { scale: 1, color: 'inherit', duration: 0.4, ease: "back.out(1.7)", overwrite: "auto" }
        );
        scoreElement.textContent = newScore;
    }
}
