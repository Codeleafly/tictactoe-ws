/* js/utils.js */

/**
 * Generates a random integer between min (inclusive) and max (inclusive).
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} A random integer.
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Debounces a function, so it only runs after a certain delay.
 * @param {function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {function} The debounced function.
 */
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

/**
 * Plays a sound effect.
 * @param {string} src - The source URL of the sound file.
 */
function playSound(src) {
    if (window.gameSettings && window.gameSettings.soundEffects) {
        const audio = new Audio(src);
        audio.play().catch(e => console.error("Error playing sound:", e));
    }
}

/**
 * Saves game settings to local storage.
 * @param {object} settings - The settings object to save.
 */
function saveSettings(settings) {
    localStorage.setItem('ticTacToeSettings', JSON.stringify(settings));
}

/**
 * Loads game settings from local storage.
 * @returns {object} The loaded settings or default settings if none found.
 */
function loadSettings() {
    const savedSettings = localStorage.getItem('ticTacToeSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
        gameMode: 'PvP',
        aiDifficulty: 'easy',
        soundEffects: true,
        darkMode: true // Default to dark mode
    };
}
