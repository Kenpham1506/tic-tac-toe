const gameBoard = document.getElementById('gameBoard');
const cells = document.querySelectorAll('.cell');
const connectionStatus = document.getElementById('connectionStatus');
const signalCodeElement = document.getElementById('signalCode');
const remoteSignalInput = document.getElementById('remoteSignal');
const connectButton = document.getElementById('connectButton');

let peer;
let currentPlayer = 'X';
let isMyTurn = false;

// Initialize the peer connection
function initializePeer(initiator) {
    peer = new SimplePeer({ initiator: initiator, trickle: false });

    peer.on('signal', data => {
        signalCodeElement.innerText = `Signal Code: ${JSON.stringify(data)}`;
        console.log('Signal:', data); // Log the signal data
    });

    peer.on('connect', () => {
        connectionStatus.innerText = 'Connected!';
        console.log('Connected to peer'); // Log when connected

        if (initiator) {
            isMyTurn = true;  // Initiator starts the game
        }
    });

    peer.on('data', data => {
        console.log('Data received:', data); // Log received data
        const { index, player } = JSON.parse(data);
        cells[index].innerText = player;
        cells[index].style.pointerEvents = 'none';

        if (checkWinner(player)) {
            alert(`${player} wins!`);
            resetGame();
        } else if (isBoardFull()) {
            alert("It's a draw!");
            resetGame();
        } else {
            switchPlayer();
            isMyTurn = true;  // Only set turn to true after receiving the opponent's move
        }
    });
}

// Handle cell click
cells.forEach(cell => {
    cell.addEventListener('click', () => {
        if (cell.innerText === '' && isMyTurn) {
            cell.innerText = currentPlayer;
            cell.style.pointerEvents = 'none';
            const index = cell.dataset.index;
            peer.send(JSON.stringify({ index, player: currentPlayer }));
            if (checkWinner(currentPlayer)) {
                alert(`${currentPlayer} wins!`);
                resetGame();
            } else if (isBoardFull()) {
                alert("It's a draw!");
                resetGame();
            } else {
                switchPlayer();
                isMyTurn = false; // Disable turn after making a move
            }
        }
    });
});

// Connect to a remote peer
connectButton.addEventListener('click', () => {
    const remoteSignal = JSON.parse(remoteSignalInput.value);
    peer.signal(remoteSignal);
});

// Start the peer connection
initializePeer(true);

// Switch player
function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
}

// Check for a winner
function checkWinner(player) {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    return winningCombinations.some(combination => {
        return combination.every(index => cells[index].innerText === player);
    });
}

// Check if the board is full
function isBoardFull() {
    return [...cells].every(cell => cell.innerText !== '');
}

// Reset the game
function resetGame() {
    cells.forEach(cell => {
        cell.innerText = '';
        cell.style.pointerEvents = 'auto';
    });
    currentPlayer = 'X';
    isMyTurn = false;
    if (peer.initiator) {
        isMyTurn = true;  // Re-enable the turn for the initiator on reset
    }
}
