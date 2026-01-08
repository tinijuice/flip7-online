import './assets/css/style.scss';
import * as UI from './assets/js/ui.js';
import * as Game from './assets/js/game.js';
import * as Socket from './assets/js/socket.js';

let socket = Socket.initSocket();
UI.setSocket(socket);


function setGlobalEvent() {
    document.addEventListener('click', (e) => {
        const actions = {
            setCreateBtn: () => setCreateBtn(e),
            setJoinBtn: () => setJoinBtn(e),
            createRoom: () => createRoom(e),
            joinRoom: () => joinRoom(e),
            startGame: () => startGame(e),
        };

        const action = Object.keys(actions).find(key => e.target.closest(`.${key}, #${key}`));
        if (action) actions[action]();
    });
}


function setPlayerId() {

    socket.on("connect", () => {
        document.getElementById('playerID').dataset.id = socket.id;
    });
}

function getRoomId() {

    return document.getElementById('roomId').dataset.id
}

////////////////////////////////////
// Procéssus de création de room///
//////////////////////////////////
function setCreateBtn(e) {

    e.preventDefault()

    const launch = document.querySelector('.launch')
    const starting = document.querySelector('.starting.active')
    if (starting) starting.classList.remove('active')

    if (launch.classList.contains('active')) return

    launch.classList.add('active')

    let code = generateCode()
    code = '000000'
    document.querySelector('.launch .code p').textContent = code;
}


function generateCode() {

    let code = "";

    for (let i = 0; i < 6; i++) {
        code += Math.floor(Math.random() * 10);
    }

    return code
}


function createRoom(e) {

    e.preventDefault()

    e.target.classList.add('hidden')
    document.getElementById('startGame').classList.remove('hidden')

    const code = document.querySelector('.launch .code p').textContent;
    // addRoomId(code)
    const roomId = code

    const data = setPlayerData()

    socket.emit('create-room', roomId, data)
}


function addRoomId(code) {

    const roomIdBox = document.getElementById('roomId').dataset.id = code
}


///////////////////////////////////////
// Procéssus pour rejoindre une room//
////////////////////////////////////
function setJoinBtn(e) {

    e.preventDefault()

    const joinGame = document.querySelector('.joinGame')
    const starting = document.querySelector('.starting.active')
    if (starting) starting.classList.remove('active')

    if (joinGame.classList.contains('active')) return

    joinGame.classList.add('active')
}


function joinRoom(e) {

    e.preventDefault()

    const data = setPlayerData()
    const roomId = getRoomId()

    socket.emit('join-room', roomId, data)
}


function setPlayerData() {

    const pseudo = document.getElementById('inputPseudo').value;
    const playerId = document.getElementById('playerID').dataset.id;

    const data = { id: playerId, pseudo: pseudo };

    return data;
}


//////////////////////////
// Set up de la partie//
//////////////////////
function startGame(e) {
    
    e.preventDefault()
    socket.emit('start-game', getRoomId())
}








function init() {

    setPlayerId();
    setGlobalEvent();
}








init();
