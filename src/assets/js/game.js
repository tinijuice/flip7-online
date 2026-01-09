// game.js
import { io } from "socket.io-client";
let socket = null;

export function setSocket(s) {
    socket = s;

}

export function setPlayersDefaultParams(room) {

    room.players = room.players.map(player => ({
        ...player,
        score: 0,
        actif: true,
        finish: false,
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

export function drawCard(room) {

    return room.deck.shift()
}

export function applyCardtoPlayer(player, card) {

    player.hand.push(card)
}

export function applyScoretoPlayer(player, card) {

    player.score += card.value
}

export function hasDuplicateCard(player, newCard) {
    const hand = player.hand;
    console.log(newCard.value)

    for (const card of hand) {
        if (card.value === newCard.value) {
            return newCard.value;
        }
    }

    player.actif = false
    return false;
}

export function hasReachedMaxCards(player) {

    if (player.hand.length >= 7) {

        player.finish = true
        return true
    }

    player.finish = false
    player.actif = false
    return false
}

export function nextPlayer(room) {

}