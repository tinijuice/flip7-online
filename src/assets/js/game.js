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
        scoreActuel: 0,
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

    player.scoreActuel += card.value
    player.score += card.value
}

export function hasAnyDuplicate(player, newCard) {
    const seen = new Set();

    for (const card of player.hand) {
        // doublon dans la main
        if (seen.has(card.value)) {

            console.log('caca')
            player.actif = false;
            return newCard.value;
        }

        // newCard = doublon
        if (card.value === newCard.value) {
            player.actif = false;

            player.actif = false
            return newCard.value;
        }

        seen.add(card.value);
    }

    return false;
}


export function hasReachedMaxCards(player) {

    if (player.hand.length >= 7) {

        player.finish = true
        return true
    }

    return false
}

export function nextPlayer(room) {
    const total = room.players.length

    const activePlayers = room.players.filter(p => p.actif)
    if (activePlayers.length === 0) {
        console.log("Aucun joueur actif")
        return { hasActivePlayer: false, currentPlayer: null }
    }

    let i = 0
    do {
        room.currentPlayerIndex = (room.currentPlayerIndex + 1) % total
        room.currentPlayerId = room.players[room.currentPlayerIndex].id
        i++
    } while (!room.players[room.currentPlayerIndex].actif)

    console.log('C\'est au tour de', room.players[room.currentPlayerIndex].pseudo)
    console.log('currPlayID :', room.currentPlayerId, 'currPlayIndex :', room.currentPlayerIndex)
    return { hasActivePlayer: true, currentPlayer: room.players[room.currentPlayerIndex] }
}


