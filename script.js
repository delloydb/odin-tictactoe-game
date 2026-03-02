// Tic‑Tac‑Toe – Modular IIFE pattern, console first then DOM

// ---------- Player Factory ----------
const Player = (name, marker) => {
    return { name, marker };
};

// ---------- Gameboard Module (IIFE) ----------
const Gameboard = (() => {
    let board = ['', '', '', '', '', '', '', '', ''];

    const getBoard = () => board;

    const reset = () => {
        board = ['', '', '', '', '', '', '', '', ''];
    };

    const placeMarker = (index, marker) => {
        if (board[index] === '') {
            board[index] = marker;
            return true;
        }
        return false;
    };

    const checkWinner = () => {
        const winPatterns = [
            [0,1,2], [3,4,5], [6,7,8], // rows
            [0,3,6], [1,4,7], [2,5,8], // columns
            [0,4,8], [2,4,6]           // diagonals
        ];

        for (let pattern of winPatterns) {
            const [a,b,c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a]; // 'X' or 'O'
            }
        }
        return null; // no winner
    };

    const isFull = () => board.every(cell => cell !== '');

    return { getBoard, reset, placeMarker, checkWinner, isFull };
})();

// ---------- Game Controller Module (IIFE) ----------
const GameController = (() => {
    let players = [];
    let currentPlayerIndex = 0;
    let gameOver = false;

    const startGame = (playerXName = 'Player X', playerOName = 'Player O') => {
        players = [
            Player(playerXName, 'X'),
            Player(playerOName, 'O')
        ];
        currentPlayerIndex = 0;
        gameOver = false;
        Gameboard.reset();
        DisplayController.updateBoard();
        DisplayController.setMessage(`${players[0].name}'s turn (X)`);
    };

    const getCurrentPlayer = () => players[currentPlayerIndex];

    const switchPlayer = () => {
        currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
    };

    const playRound = (index) => {
        if (gameOver) {
            DisplayController.setMessage('Game is over. Please restart.');
            return false;
        }

        const board = Gameboard.getBoard();
        if (board[index] !== '') {
            DisplayController.setMessage('Cell already taken!');
            return false;
        }

        const currentPlayer = getCurrentPlayer();
        Gameboard.placeMarker(index, currentPlayer.marker);
        DisplayController.updateBoard();

        // Check winner
        const winner = Gameboard.checkWinner();
        if (winner) {
            gameOver = true;
            const winnerName = players.find(p => p.marker === winner).name;
            DisplayController.setMessage(`${winnerName} (${winner}) wins! 🎉`);
            return true;
        }

        // Check tie
        if (Gameboard.isFull()) {
            gameOver = true;
            DisplayController.setMessage("It's a tie! 🤝");
            return true;
        }

        // No winner, switch player
        switchPlayer();
        DisplayController.setMessage(`${getCurrentPlayer().name}'s turn (${getCurrentPlayer().marker})`);
        return true;
    };

    // For console testing
    const testPlay = () => {
        console.log('Console game started – make moves by calling playRound(index) with 0-8');
        console.log('Current board:', Gameboard.getBoard());
    };

    return { startGame, playRound, testPlay };
})();

// ---------- Display Controller Module (IIFE) ----------
const DisplayController = (() => {
    const boardElement = document.getElementById('board');
    const statusElement = document.getElementById('status');
    const startBtn = document.getElementById('startBtn');
    const playerXInput = document.getElementById('playerX');
    const playerOInput = document.getElementById('playerO');

    // Create board cells
    const renderBoard = () => {
        boardElement.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            cell.addEventListener('click', cellClickHandler);
            boardElement.appendChild(cell);
        }
    };

    // Update cell contents and classes from gameboard
    const updateBoard = () => {
        const board = Gameboard.getBoard();
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            const marker = board[index];
            cell.textContent = marker;
            // Remove previous marker classes
            cell.classList.remove('X', 'O', 'taken');
            if (marker === 'X') {
                cell.classList.add('X', 'taken');
            } else if (marker === 'O') {
                cell.classList.add('O', 'taken');
            } else {
                cell.classList.remove('taken');
            }
        });
    };

    const setMessage = (msg) => {
        statusElement.textContent = msg;
    };

    // Event handler for cell clicks
    const cellClickHandler = (e) => {
        const index = e.target.dataset.index;
        GameController.playRound(parseInt(index));
    };

    // Restart game with current names
    const restartGame = () => {
        const nameX = playerXInput.value.trim() || 'Player X';
        const nameO = playerOInput.value.trim() || 'Player O';
        GameController.startGame(nameX, nameO);
    };

    // Initialise event listeners and board
    const init = () => {
        renderBoard();
        startBtn.addEventListener('click', restartGame);
        // Start a default game
        restartGame();
    };

    return { init, updateBoard, setMessage };
})();

// ---------- Initialise everything when DOM is ready ----------
document.addEventListener('DOMContentLoaded', () => {
    DisplayController.init();

    // Console testing (optional)
    console.log('Tic‑Tac‑Toe ready! Use GameController.playRound(index) to play in console.');
    console.log('Current board:', Gameboard.getBoard());
});
