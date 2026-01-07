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

        if (!rooms[roomId]) rooms[roomId] = { id: roomId, players: [] };
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

        setPlayerParams(room)

        room.deck = createDeck();
        room.currentPlayerIndex = 0;
        room.state = 'game';


        io.to(roomId).emit("game-start", {
            players: room.players.map(p => ({ id: p.id, pseudo: p.pseudo, cards: p.cards })),
            currentPlayer: room.players[room.currentPlayerIndex].id,
            id_player: socket.id
        });
    })


    function setPlayerParams(room) {

        console.log('Paramètres des joueurs mis à 0')

        room.players.forEach(player => {
            player.cards = [];
            player.score = 0;
            player.scoreActuel = 0;
            player.actif = true;
        });
    }


    socket.on('pick-card', (roomId) => {

        const room = rooms[roomId]

        if (!room) return console.log('Aucune room');

        const player = room.players[room.currentPlayerIndex];

        if (!isCurrentPlayer(socket, room)) return console.log("Ce n'est au tour de ce joueur");

        const card = drawCard(room)
        applyCardToPlayer(player, card)
        applyScoreToPlayer(player, card)
        emitPickCard(io, roomId, player, card)
        nextPlayer(room)

        console.log(`C'est à ${room.players[room.currentPlayerIndex].pseudo} de jouer`)
    })



    function isCurrentPlayer(socket, room) {

        return socket.id === room.players[room.currentPlayerIndex].id
    }

    function drawCard(room) {

        return room.deck.shift()

    }

    function applyCardToPlayer(player, card) {

        player.cards.push(card)
    }

    function applyScoreToPlayer(player, card) {
        player.scoreActuel += card.value
        player.score += card.value
    }

    function nextPlayer(room) {
        const totalPlayers = room.players.length;

        const allActive = room.players.every(player => player.actif === false);

        if (allActive) {
            console.log("Tous les joueurs sont inactifs");

            restartGame(room)
        }
        let attempts = 0;

        do {
            room.currentPlayerIndex = (room.currentPlayerIndex + 1) % totalPlayers;
            attempts++;
        } while (
            room.players[room.currentPlayerIndex].actif === false &&
            attempts < totalPlayers
        );
    }

    function emitPickCard(io, roomId, player, card) {
        io.to(roomId).emit("pick-card", {
            pseudo: player.pseudo,
            card,
            id: player.id,
            score: player.score,
            scoreActuel: player.scoreActuel,
            actif: player.actif
        })
    }



    // Update score
    socket.on("update-score", (roomId, data) => {


        const room = rooms[roomId]

        if (!room) return console.log('Aucune room');

        const player = room.players.find(player => player.id === data.id)

        player.score = data.score
        player.scoreActuel = data.scoreActuel
    })


    // Update player
    socket.on('update-player', (roomId, data) => {

        const room = rooms[roomId]

        if (!room) return console.log('Aucune room');

        const player = room.players.find(player => player.id === data.id)

        player.actif = false
    })


    socket.on('stop-my-game', (roomId, playerID) => {

        console.log(rooms[roomId])

        const room = rooms[roomId]

        if (!room) return console.log('Aucune room');

        const player = room.players.find(player => player.id === playerID)

        if (player.id !== room.players[room.currentPlayerIndex].id) {

            console.log('Pas possible de stoper maintenant')
            return
        }

        player.actif = false
        nextPlayer(room)

        io.to(roomId).emit("stop-my-game", playerID)
    })


    function restartGame(room) {

        room.deck = []

        setPlayerParams(room)
        createDeck()

        room.currentPlayerIndex = 0

        socket.to(room).emit('restart-game', room)
    }
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
