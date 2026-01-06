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


    // Démarrer une partie
    socket.on("start-game", (roomId) => {
        const room = rooms[roomId]
        if (!room) return

        if (room.players.length < 2) console.log('rien')

        room.players.forEach(player => {
            player.cards = [];
            player.score = 0;
        });

        room.deck = createDeck();
        room.currentPlayerIndex = 0;
        room.state = 'game';

        io.to(roomId).emit("game-start", {
            players: room.players.map(p => ({ id: p.id, pseudo: p.pseudo, cards: p.cards })),
            currentPlayer: room.players[room.currentPlayerIndex].id,
            id_player: socket.id
        });
    })


    //Piocher une carte
    socket.on("pick-card", (roomId) => {

        const room = rooms[roomId]
        if (!room) return console.log('non');

        const player = room.players[room.currentPlayerIndex];

        if (socket.id !== player.id) return console.log('Pas au tour de ce joueur')

        const card = room.deck.shift();
        player.cards.push(card);
        player.score += card.value


        console.log("Carte piochée :", card);

        io.to(roomId).emit("pick-card", { pseudo: player.pseudo, card, id: player.id, score: player.score});

        room.currentPlayerIndex++
        if (room.currentPlayerIndex >= room.players.length) room.currentPlayerIndex = 0

        console.log(`C'est à ${room.players[room.currentPlayerIndex].pseudo} de jouer`);
    })


    // Update game
    socket.on("update-game", (roomId, playerId) => {

        const room = rooms[roomId];

        if (!room) return

        const players = room.players

        const player = players.find((p) => p.id === playerId);

        console.log(player)


    })

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
