// game.js
let socket = null;

export function setSocket(s) {
    socket = s;
}

export function startGame() {
    console.log("Démarrage du jeu !");
    if (socket) socket.emit('game-start');
}
