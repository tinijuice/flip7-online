const fragment = document.createDocumentFragment()

// ui.js
let socket = null;

export function setSocket(s) {
    socket = s;
}

export function updateLobby(room) {

    const display = document.querySelector('#lobby .cards')

    display.innerHTML = ''

    room.players.forEach(player => {

        const template = document.getElementById('cardPlayerTemplate').content.cloneNode(true)

        template.querySelector('.pseudo').textContent = player.pseudo

        fragment.append(template)
    });

    display.append(fragment)

    document.querySelector('.numPlayers').textContent = `${room.players.length}/6 joueurs`
}

export function setGameArea(room) {

    toggleArea()

    const display = document.querySelector('#game .players-container')

    room.players.forEach(player => {

        const template = document.getElementById('playerAreaTemplate').content.cloneNode(true)

        template.querySelector('.pseudo').textContent = player.pseudo
        template.querySelector('.score').textContent = player.score
        template.querySelector('.player-area').dataset.playerId = player.id

        fragment.append(template)
    });

    display.append(fragment)

    document.querySelector('.player-area[data-player-id="' + socket.id + '"]').classList.add('me')
}

function toggleArea() {

    const sections = ['home', 'lobby', 'game'];

    sections.forEach(s => {
        document.getElementById(s).classList.toggle('hidden')
    });
}
