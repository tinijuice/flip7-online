import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
let players = [];

// Fonction pour envoyer à tous le nombre de joueurs
function broadcastPlayerCount() {
    const count = players.length;
    const message = JSON.stringify({ type: 'playerCount', count });

    players.forEach(player => {
        player.send(message);
    });
}

wss.on('connection', (ws) => {
    players.push(ws)

    broadcastPlayerCount()

    ws.on('message', (message) => {
        players.forEach(player => {
            if (player !== ws) player.send(message)
        });
    });

    ws.on('close', () => {
        players = players.filter(p => p !== ws)
        broadcastPlayerCount()
    });
});

console.log('Serveur WS lancé sur le port 8080')
