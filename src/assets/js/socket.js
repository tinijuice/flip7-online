// js/socket.js
import { io } from "socket.io-client";
import * as UI from './ui.js';
import * as Game from './game.js';


export function initSocket() {
    const socket = io("http://localhost:3000");


    socket.on('update-lobby', (room) => {

        UI.updateLobby(room)
    })

    socket.on('game-start', (room) => {

        UI.setGameArea(room)
    })

    socket.on('update-player-area', (player, card)=>{

        UI.updatePlayerArea(player, card)
    })

    return socket;
}
