import './assets/css/style.scss';
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

function setGlobalEvent() {
    document.addEventListener('click', (e) => {
        const actions = {
            box: () => box(e),
            create: () => createGame(e),
            copyBox: () => copyCode(e)
        };

        const action = Object.keys(actions).find(key => e.target.closest(`.${key}, #${key}`));
        if (action) actions[action]();
    });
}


function init() {
    setGlobalEvent();
}



function box(e) {

    const box = e.target
}

socket.on('boxColor', (color) => {
    box.style.backgroundColor = color;
});


function createGame(e) {

    e.preventDefault()
    const createBtn = e.target
    const launch = document.querySelector('.launch')
    const inputPseudo = document.getElementById('inputPseudo')

    if (inputPseudo.value === '') {
        alert('Merci de renseigner un pseudo.')
        return
    }

    launch.classList.add('active')
}

function copyCode() {

    const code = document.querySelector('.code').textContent
    navigator.clipboard.writeText(code)

}







init();
