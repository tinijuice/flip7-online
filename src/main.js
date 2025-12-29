import './assets/css/style.scss';
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");


function setGlobalEvent() {
    document.addEventListener('click', e => {

        const actions = {

            // Exemple d'utilisation
            // Classe du HTML: () => function(e)
            box: () => box(e)
        };

        const action = Object.keys(actions).find(key => e.target.closest(`.${key}`))
        if (action) actions[action]()
    })
}

function init() {
    setGlobalEvent()
    playerCount()
}


function playerCount() {
    socket.on('nombre_clients', (nombre) => {
        document.getElementById('compteur').textContent = nombre;
    });
}



let isRed = false
const test = document.getElementById('box')

function box() {
    isRed = !isRed

    test.style.backgroundColor = isRed ? 'red' : 'green'

    const style = getComputedStyle(test);
    const color = style.backgroundColor;

    socket.emit('boxColor', color)

}

socket.on('boxColor', (color) => {
    test.style.backgroundColor = color
});













init()

