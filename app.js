const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusDiv = document.getElementById('status');

let peer;
let isInitiator = false;
let currentPlayer = 'X';

// Initialize the game board
cells.forEach(cell => {
    cell.addEventListener('click', () => {
        if (cell.textContent === '' && currentPlayer === 'X') {
            cell.textContent = 'X';
            sendMove(cell.dataset.index, 'X');
            currentPlayer = 'O';
            checkWinner();
        }
    });
});

// WebRTC setup
const startPeer = () => {
    peer = new SimplePeer({ initiator: isInitiator, trickle: false });

    peer.on('signal', data => {
        // Send signaling data to the other peer
        // (In a real app, this would be done via WebSocket)
        console.log(JSON.stringify(data));
    });

    peer.on('connect', () => {
        statusDiv.textContent = 'Connected! Your turn.';
        board.classList.remove('hidden');
    });

    peer.on('data', data => {
        const { index, player } = JSON.parse(data);
        cells[index].textContent = player;
        currentPlayer = 'X';
        checkWinner();
    });

    peer.on('close', () => {
        statusDiv.textContent = 'Peer disconnected.';
        board.classList.add('hidden');
    });
};

// Function to handle move sending
const sendMove = (index, player) => {
    if (peer.connected) {
        peer.send(JSON.stringify({ index, player }));
        statusDiv.textContent = "Waiting for opponent's move...";
    }
};

// Check for a winner
const checkWinner = () => {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (cells[a].textContent && cells[a].textContent === cells[b].textContent && cells[a].textContent === cells[c].textContent) {
            statusDiv.textContent = `${cells[a].textContent} wins!`;
            board.classList.add('hidden');
            return;
        }
    }
    if ([...cells].every(cell => cell.textContent)) {
        statusDiv.textContent = 'Draw!';
        board.classList.add('hidden');
    }
};

// Initialize the peer connection
isInitiator = confirm("Are you the first player?");
startPeer();

// Listen for signaling data (copy this between players manually in this example)
const signalingData = prompt("Paste the signaling data from the other player:");
if (signalingData) {
    peer.signal(JSON.parse(signalingData));
}
