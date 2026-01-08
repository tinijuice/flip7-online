// game.js
let socket = null;

export function setSocket(s) {
    socket = s;

}

export function setPlayersDefaultParams(room) {

    room.players = room.players.map(player => ({
        ...player,
        score: 0,
        actif: true,
        hand: []
    }));
}

export function createDeck() {
    const deck = [];

    for (let i = 0; i <= 12; i++) {
        for (let j = 0; j < i; j++) {
            deck.push({ type: "number", value: i });
        }
    }

    return shuffle(deck);
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

export function setOrderPlayers(room) {
    
    
}