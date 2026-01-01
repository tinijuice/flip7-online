// import { act } from 'react';
import './assets/css/style.scss';
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");
const fragment = document.createDocumentFragment()

function setGlobalEvent() {
    document.addEventListener('click', (e) => {
        const actions = {
            box: () => box(e),
            create: () => chooseCreateOrJoin(e),
            join: () => chooseCreateOrJoin(e),
            openRoom: () => openRoom(e),
            join2: () => joinRoom(e),
            startGame: () => startGame(e),
            copyBox: () => copyCode(e)
        };

        const action = Object.keys(actions).find(key => e.target.closest(`.${key}, #${key}`));
        if (action) actions[action]();
    });
}


function init() {
    setGlobalEvent();
}


function chooseCreateOrJoin(e) {

    e.preventDefault()

    const selectBtn = e.target
    const data = selectBtn.dataset.btn
    const box = document.querySelector('.' + data)

    if (data === 'launch' && !box.classList.contains('active')) {

        const codeBox = document.querySelector('.code p')

        let code = []
        for (let i = 0; i < 6; i++) {
            code += Math.floor(Math.random() * 10)
        }

        codeBox.textContent = code
    }

    const active = document.querySelector('.starting.active')
    if (active) active.classList.remove('active')

    box.classList.add('active')

}

function copyCode(e) {
    
    e.target.classList.add('animation')

    const code = document.querySelector('.code p').textContent
    navigator.clipboard.writeText(code)

    setTimeout(() => {
        e.target.classList.remove('animation')
    }, 300);

}


function openRoom(e) {
    e.preventDefault();

    const roomId = document.querySelector('.code p').textContent;
    const pseudo = document.getElementById('inputPseudo').value;

    if (roomId === '') return
    if (roomId.length !== 6)
        if (!pseudo) return

    socket.emit("create-room", roomId, pseudo);

    const btnCreate = e.target
    const btnStart = document.getElementById('startGame')

    btnCreate.classList.toggle('hidden')
    btnStart.classList.toggle('hidden')

}

socket.on("room-created", (roomId, pseudo) => {
    console.log(`Le joueur ${pseudo} a crée la room ${roomId}`);
});



function joinRoom(e) {
    e.preventDefault();

    const codeInput = document.querySelector('.code-to-paste').value;
    const pseudo = document.getElementById('inputPseudo').value;

    if (codeInput === '') return;
    if (codeInput.length !== 6) return;
    if (!pseudo) return

    const roomId = codeInput;

    socket.emit("join-room", roomId, pseudo);

}

socket.on("room-update", (players) => {

    const cardsPlayers = document.querySelector('#lobby .cards');
    cardsPlayers.innerHTML = '';

    console.log(players)

    players.forEach(player => {

        const template = document.querySelector('#cardPlayerTemplate').content.cloneNode(true);

        template.querySelector('.pseudo').textContent = player.pseudo;
        fragment.append(template);
    });

    cardsPlayers.append(fragment);

    const numPlayers = document.querySelector('#lobby .numPlayers')
    numPlayers.textContent = players.length + '/6 joueurs'

});

socket.on("error-room", (message) =>{
    console.log(message)
})


function startGame(e) {
    
    e.preventDefault();

    const btnStart = e.target
    const home = document.getElementById('home')
    const game = document.getElementById('game')
    const lobby = document.getElementById('lobby')

    home.classList.toggle('hidden')
    game.classList.toggle('hidden')
    lobby.classList.toggle('hidden')

}








init();
