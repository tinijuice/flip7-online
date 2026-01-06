// import { act } from 'react';
import { compile } from 'sass';
import './assets/css/style.scss';
import { io } from "socket.io-client";


const socket = io("http://localhost:3000");
const fragment = document.createDocumentFragment()



socket.on("connect", () => {

    const playerIdBox = document.getElementById('playerID');
    playerIdBox.textContent = socket.id;
});




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

function getRoomId() {

    const roomId = document.getElementById('roomId').textContent

    return roomId
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

        // codeBox.textContent = code
        // roomIdBox.textContent = code
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

    const containerMe = document.querySelector('#game .players-container')
    const containerOther = document.querySelector('#game .players-container .other')
    const playerID = document.getElementById('playerID').textContent

    const me = data.players.find(p => p.id === playerID)
    const others = data.players.filter(p => p.id !== playerID)

    const orderedPlayers = [me, ...others]



    orderedPlayers.forEach((player, index) => {

        const template = document.querySelector('#playerAreaTemplate').content.cloneNode(true)

        const playerArea = template.querySelector('.player-area')

        playerArea.classList.add('player-area-' + (index + 1))
        playerArea.dataset.playerId = player.id

        if (index === 0) {
            playerArea.classList.add('me')
        } else {
            playerArea.classList.add('other')
        }

        fragment.append(template)
    })

    containerOther.append(fragment)

})

function pickCard(e) {

    const roomId = document.getElementById('roomId').textContent;
    socket.emit('pick-card', roomId);

}

socket.on("pick-card", (data) => {

    console.log(data)


    const playerArea = document.querySelector(`.player-area[data-player-id="${data.id}"]`)
    const cardsValues = Array.from(playerArea.querySelectorAll('.card')).map(card => card.dataset.value);

    const pickedCardValue = String(data.card.value)
    const displayCards = playerArea.querySelector('.cards')


    if (displayCards.children.length >= 7) {
        return
    }
    if (cardsValues) {
        if (cardsValues.includes(pickedCardValue)) {

            const playerId = data.id
            const roomId = getRoomId()

            socket.emit('update-game', roomId, playerId)
            playerArea.classList.add('lost')
            return
        }
    }

    const template = document.getElementById('cardTemplate').content.cloneNode(true)


    template.querySelector('.card').dataset.value = data.card.value
    template.querySelector('.number').textContent = data.card.value
    displayCards.append(template)

    // socket.emit('update-game', ())
})





init();
