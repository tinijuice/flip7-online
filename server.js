import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

// Autoriser CORS pour Vite (port 5173)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});


function room() {

    const rooms = {}; // { roomId: { players: [pseudo1, pseudo2] } }

    io.on("connection", (socket) => {

        socket.on("create-room", (roomId, pseudo) => {
            socket.join(roomId);

            if (!rooms[roomId]) rooms[roomId] = { players: [] };
            rooms[roomId].players.push({ id: socket.id, pseudo });

            io.to(roomId).emit("room-update", rooms[roomId].players);
        });

        socket.on("join-room", (roomId, pseudo) => {
            const room = rooms[roomId];
            if (!room) {
                socket.emit("error-room", `La room ${roomId} n'existe pas !`);
                return;
            }

            if (room.players.length >= 6) {
                socket.emit("error-room", "La room est pleine !");
                return;
            }


            // Vérifier si le socket est déjà dans la room
            const alreadyJoined = room.players.some(p => p.id === socket.id);
            if (alreadyJoined) {
                socket.emit("error-room", `Vous êtes déjà dans la room ${roomId}`);
                return;
            }

            socket.join(roomId);
            room.players.push({ id: socket.id, pseudo });

            io.to(roomId).emit("room-update", room.players);
        });

        // gérer la déconnexion
        socket.on("disconnecting", () => {
            socket.rooms.forEach((roomId) => {
                const room = rooms[roomId];
                if (!room) return;
                room.players = room.players.filter(p => p.id !== socket.id);
                io.to(roomId).emit("room-update", room.players);
            });
        });
    });
}



function init() {

    room()
    // playerCount()
}


server.listen(3000, () => {
    console.log('Serveur Socket.IO lancé sur http://localhost:3000');
});

init()
