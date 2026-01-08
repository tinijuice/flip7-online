import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

import * as Game from './src/assets/js/game.js';
import { create } from 'domain';


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
        Game.setOrderPlayers(room)

        const cards = Game.createDeck()
        room.deck = []
        room.deck.push(cards)

        console.log(room)
        io.to(roomId).emit('game-start', room)
    })
});


function isRoomExist(roomId) {

    return rooms[roomId]
}










server.listen(3000, () => {
    console.log('Serveur Socket.IO lancé sur http://localhost:3000');
});
