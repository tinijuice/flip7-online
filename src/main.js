import './assets/css/style.scss';

const socket = new WebSocket('ws://localhost:8080');

function playerCount() {
    const playerCounterEl = document.querySelector('.playerCount');

    socket.addEventListener('message', (e) => {
        const data = JSON.parse(e.data);

        if (data.type === 'playerCount') {
            playerCounterEl.textContent = `Joueurs en ligne : ${data.count}`;
        }
    });
}






function setGlobalEvent() {
    document.addEventListener('click', e => {

        const actions = {

            // Exemple d'utilisation
            // Classe du HTML: () => function(e)
        };

        const action = Object.keys(actions).find(key => e.target.closest(`.${key}`))
        if (action) actions[action]()
    })
}

function init() {
    setGlobalEvent()
    playerCount()
}








init()

