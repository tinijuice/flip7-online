// import { act } from 'react';
import { compile } from 'sass';
import './assets/css/style.scss';
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");
const fragment = document.createDocumentFragment()

function setGlobalEvent() {
    document.addEventListener('click', (e) => {
        const actions = {

            create: () => chooseCreateOrJoin(e),
            join: () => chooseCreateOrJoin(e),
            openRoom: () => openRoom(e),
            join2: () => joinRoom(e),
            startGame: () => startGame(e),
            pioche: () => pickCard(e),
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
        const roomIdBox = document.getElementById('roomId')

        let code = []
        for (let i = 0; i < 6; i++) {
            code += Math.floor(Math.random() * 10)
        }

        codeBox.textContent = code
        roomIdBox.textContent = code
    }

    const active = document.querySelector('.starting.active')
    if (active) active.classList.remove('active')

    box.classList.add('active')

}

function copyCode(e) {

    e.target.classList.add('animation')

    const code = document.getElementById('roomId').textContent
    navigator.clipboard.writeText(code)

    setTimeout(() => {
        e.target.classList.remove('animation')
    }, 300);

}


function openRoom(e) {
    e.preventDefault();

    const roomId = document.getElementById('roomId').textContent;
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
    const roomIdBox = document.getElementById('roomId')

    roomIdBox.textContent = codeInput

    socket.emit("join-room", roomId, pseudo);

}

socket.on("room-update", (players) => {

    const cardsPlayers = document.querySelector('#lobby .cards');
    cardsPlayers.innerHTML = '';

    players.forEach(player => {

        const template = document.querySelector('#cardPlayerTemplate').content.cloneNode(true);

        template.querySelector('.pseudo').textContent = player.pseudo;
        fragment.append(template);
    });

    cardsPlayers.append(fragment);

    const numPlayers = document.querySelector('#lobby .numPlayers')
    numPlayers.textContent = players.length + '/6 joueurs'

});

socket.on("error-room", (message) => {
    console.log(message)
})


function startGame(e) {

    e.preventDefault();
    const roomId = document.getElementById('roomId').textContent

    socket.emit("start-game", roomId);
}

socket.on("game-start", (data) => {

    const home = document.getElementById('home');
    const game = document.getElementById('game');
    const lobby = document.getElementById('lobby');

    home.classList.toggle('hidden');
    game.classList.toggle('hidden');
    lobby.classList.toggle('hidden');

    const main = document.querySelector('.main')
    main.dataset.id = data.id_player

})

function pickCard(e) {

    const roomId = document.getElementById('roomId').textContent;
    socket.emit('pick-card', roomId);

}

socket.on("pick-card", (data) => {

    const roomId = document.getElementById('roomId').textContent

    const main = document.querySelector('.main')
    const cardsValues = Array.from(main.querySelectorAll('.cardInHand')).map(card => card.dataset.value);

    const pickedCardValue = String(data.card.value)

    // console.log('lastCardValue = ', lastCardValue)
    // console.log('pickedCardValue', pickedCardValue)


    if (main.children.length >= 7) return
    if (cardsValues) {
        if (cardsValues.includes(pickedCardValue)) return
    }

    socket.emit("update-game", (roomId))


    const template = document.getElementById('cardTemplate').content.cloneNode(true)


    template.querySelector('.cardInHand').dataset.value = data.card.value
    template.querySelector('.number').textContent = data.card.value
    main.append(template)
})





init();
