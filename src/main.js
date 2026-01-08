import './assets/css/style.scss';
import * as UI from './assets/js/ui.js';
import * as Game from './assets/js/game.js';
import * as Socket from './assets/js/socket.js';


let socket = null;

function setGlobalEvent() {
    document.addEventListener('click', (e) => {
        const actions = {
            create: () => UI.chooseCreateOrJoin(e),
            startGame: () => Game.startGame(), // exemple
            sendMessage: () => UI.sendMessage(socket, "Hello")
        };

        const action = Object.keys(actions).find(key => e.target.closest(`.${key}, #${key}`));
        if (action) actions[action]();
    });
}


function init() {

    socket = Socket.initSocket(); 

    UI.setSocket(socket);
    Game.setSocket(socket);

    setGlobalEvent();
}








init();
