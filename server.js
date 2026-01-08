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





const rooms = {};

io.on("connection", (socket) => {

    





});



function createDeck() {
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










server.listen(3000, () => {
    console.log('Serveur Socket.IO lancé sur http://localhost:3000');
});
