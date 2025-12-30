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


function playerCount() {
    io.on('connection', (socket) => {
        console.log('Un client est connecté');

        const playerCount = io.sockets.sockets.size
        console.log('Clients connectés :', playerCount);

        io.emit('nombre_clients', playerCount);

        socket.on('disconnect', () => {
            const playerCount = io.sockets.sockets.size;
            console.log('Client déconnecté. Clients restants :', playerCount);
            io.emit('nombre_clients', playerCount);
        });
    });
}


function changeBoxColor() {
    io.on('connection', (socket) => {
        socket.on('boxColor', (color) => {
            io.emit('boxColor', color);
        });
    })
}

function init() {
    
    // playerCount()
    changeBoxColor()
}


server.listen(3000, () => {
    console.log('Serveur Socket.IO lancé sur http://localhost:3000');
});

init()
