const gameBoard = document.getElementById('gameBoard');
const cells = document.querySelectorAll('.cell');
const connectionStatus = document.getElementById('connectionStatus');
const signalCodeElement = document.getElementById('signalCode');
const remoteSignalInput = document.getElementById('remoteSignal');
const connectButton = document.getElementById('connectButton');

let peer;
let currentPlayer = 'X';

// Initialize the peer connection
function initializePeer(initiator) {
    peer = new SimplePeer({ initiator: initiator, trickle: false });

    peer.on('signal', data => {
        signalCodeElement.innerText = `Signal Code: ${JSON.stringify(data)}`;
    });

    peer.on('connect', () => {
        connectionStatus.innerText = 'Connected!';
    });

    peer.on('data', data => {
        const { index, player } = JSON.parse(data);
        cells[index].innerText = player;
        cells[index].style.pointerEvents = 'none';
        switchPlayer();
    });
}

// Switch player
function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
}

// Handle cell click
cells.forEach(cell => {
    cell.addEventListener('click', () => {
        if (cell.innerText === '') {
            cell.innerText = currentPlayer;
            cell.style.pointerEvents = 'none';
            const index = cell.dataset.index;
            peer.send(JSON.stringify({ index, player: currentPlayer }));
            switchPlayer();
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
