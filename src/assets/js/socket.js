// js/socket.js
import { io } from "socket.io-client";
import * as UI from './ui.js';
import * as Game from './game.js';


export function initSocket() {
    const socket = io();

    socket.on('room-update', (players) => {
        console.log("Room update :", players);
    });

    socket.on('game-started', () => {
        UI.startGame();
    });

    return socket;
}
