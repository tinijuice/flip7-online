import './assets/css/style.scss';
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

function setGlobalEvent() {
    document.addEventListener('click', e => {
        const actions = {
            box: () => box(e),
            create: () => createGame(e)
        };

        const action = Object.keys(actions).find(key => e.target.closest(`.${key}`));
        if (action) actions[action]();
    });
}

function init() {
    setGlobalEvent();
    playerCount();
}



function box(e) {

    const box = e.target
}

socket.on('boxColor', (color) => {
    box.style.backgroundColor = color;
});


function (params) {
    
}






init();
