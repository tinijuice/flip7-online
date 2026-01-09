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

        io.to(roomId).emit('game-start', room)
    })


    socket.on('pick-card', (roomId) => {

        if (!isRoomExist(roomId)) return ('La room', roomId, "n'existe pas");
        const room = rooms[roomId]

        const player = room.players[room.currentPlayerIndex]

        if (!isCurrentPlayer(socket, room)) {

            const player = room.players.find(p => p.id === socket.id).pseudo
            console.log("Ce n'est pas au tour de", player)
            return
        }


        const card = Game.drawCard(room)

        if (Game.hasReachedMaxCards(player)) {
            console.log("finish :", player.finish)
            console.log(player.pseudo, "à atteint la limite de carte")
            return
        }

        Game.applyCardtoPlayer(player, card)

        if (Game.hasDuplicateCard(player, card)) {

            console.log("actif: ", player.actif)
            console.log(player.pseudo, "à deux fois la carte", Game.hasDuplicateCard(player, card))
            return
        }

        Game.applyScoretoPlayer(player, card)

        io.to(roomId).emit('update-player-area', player, card)

        Game.nextPlayer(room)

        console.log(player.pseudo, "à pioché un", card.value)
        console.log(player.hand)

    })




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
