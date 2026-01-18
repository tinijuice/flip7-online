import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

import * as Game from './src/assets/js/game.js';


// Autoriser CORS pour Vite (port 5173)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});





const rooms = {};

io.on("connection", (socket) => {


    socket.on('create-room', (roomId, data) => {

        if (rooms[roomId]) return console.log('Room :', roomId, 'déjà existante');

        rooms[roomId] = { players: [] }

        const room = rooms[roomId]

        room.roomID = roomId
        room.players.push(data)

        socket.join(roomId);
        console.log(data.pseudo, 'à crée la room :', roomId)

        io.to(roomId).emit('update-lobby', room);
    })


    socket.on('join-room', (roomId, data) => {

        if (!isRoomExist(roomId)) return ('La room', roomId, "n'existe pas");
        const room = rooms[roomId]

        if (isPlayerAlreadyInRoom(room, data)) return console.log(data.pseudo, 'déjà dans la room');

        room.players.push(data)
        socket.join(roomId);
        console.log(data.pseudo, 'à rejoint la room :', roomId)

        io.to(roomId).emit('update-lobby', room);
    })

    function isPlayerAlreadyInRoom(room, data) {

        return room.players.some(player => player.id === data.id);
    }


    socket.on("disconnect", () => {
        console.log("Joueur déconnecté :", socket.id)
    });


    socket.on('start-game', (roomId) => {

        if (!isRoomExist(roomId)) return ('La room', roomId, "n'existe pas");
        const room = rooms[roomId]

        Game.setPlayersDefaultParams(room)

        room.deck = Game.createDeck()

        room.currentPlayerIndex = 0
        room.currentPlayerId = room.players[room.currentPlayerIndex].id



        io.to(roomId).emit('game-start', room)
        io.to(roomId).emit('current-player', room)

        console.log(room)
    })


    socket.on('pick-card', (roomId) => {

        if (!isRoomExist(roomId)) {
            console.log("La room n'existe pas :", roomId)
            return
        }

        const room = rooms[roomId]
        let player = room.players[room.currentPlayerIndex]

        // Sécurité : pas son tour
        if (!isCurrentPlayer(socket, room)) {
            const pseudo = room.players.find(p => p.id === socket.id)?.pseudo
            console.log("Ce n'est pas au tour de", pseudo)
            return
        }

        // Joueur éliminé
        if (!player.actif) {
            console.log('Erreur, joueur éliminé :', player.pseudo)
            return
        }

        const card = Game.drawCard(room)

        /* ============================
            LIMITE DE CARTES ATTEINTE
        ============================ */
        if (Game.hasReachedMaxCards(player)) {

            const result = Game.nextPlayer(room)
            hasActivePlayer(roomId, result, player)

            console.log(player.pseudo, "a atteint la limite de cartes")
            return
        }

        /* ============================
            CARTE EN DOUBLE
        ============================ */
        if (Game.hasAnyDuplicate(player, card)) {

            Game.applyCardtoPlayer(player, card)

            // reset score
            player.score -= player.scoreActuel
            player.scoreActuel = 0

            io.to(roomId).emit('update-player-area', player, card)

            const result = Game.nextPlayer(room)
            hasActivePlayer(roomId, result, player)
            
            return

        }

        /* ============================
            CAS NORMAL
        ============================ */
        Game.applyCardtoPlayer(player, card)
        Game.applyScoretoPlayer(player, card)

        io.to(roomId).emit('update-player-area', player, card)

        console.log(player.pseudo, "a pioché un", card.value)

        const result = Game.nextPlayer(room)
        hasActivePlayer(roomId, result, player)
    })



    function hasActivePlayer(roomId, result, player) {

        const room = rooms[roomId]

        if (!result.hasActivePlayer) {
            console.log('Fin de partie')
            io.to(roomId).emit('game-over', room)
            return
        }

        io.to(roomId).emit('current-player', room)
        console.log(player.pseudo, "a pioché un doublon")
        return
    }


    function isCurrentPlayer(socket, room) {

        return socket.id === room.players[room.currentPlayerIndex].id
    }

});



function isRoomExist(roomId) {

    return rooms[roomId]
}










server.listen(3000, () => {
    console.log('Serveur Socket.IO lancé sur http://localhost:3000');
});
