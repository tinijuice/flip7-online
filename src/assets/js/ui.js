const fragment = document.createDocumentFragment()

// ui.js
let socket = null;

function getCurrentPlayerArea(player) {

    return document.querySelector('.player-area[data-player-id="' + player.id + '"]')
}

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


export function addCardInGameArea(player, card) {

    const display = document.querySelector('.player-area[data-player-id="' + player.id + '"] .cards')
    const template = document.getElementById('cardTemplate').content.cloneNode(true)

    template.querySelector('.number').textContent = card.value
    template.querySelector('.card').dataset.value = card.value

    display.append(template)


}

export function markCurrentPlayer(player) {

    const currentPlayer = document.querySelector('.player-area.currentPlayer')
    const newCurrentPlayer = getCurrentPlayerArea(player)

    if (currentPlayer && newCurrentPlayer) {

        currentPlayer.classList.remove('currentPlayer')
        newCurrentPlayer.classList.add('currentPlayer')
        return
    }

    newCurrentPlayer.classList.add('currentPlayer')

}

export function addScoreToPlayer(player) {

    const playerArea = getCurrentPlayerArea(player)

    playerArea.querySelector('.score').textContent = player.score
    playerArea.querySelector('.scoreActuel').textContent = player.scoreActuel
}
