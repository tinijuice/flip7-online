// ui.js
let socket = null;

export function setSocket(s) {
    socket = s;
}

export function chooseCreateOrJoin(e) {
    console.log("Choose create or join :", e.target);
    if (socket) socket.emit('choose', e.target.id);
}

export function sendMessage(socket, msg) {
    if (!socket) return;
    socket.emit('message', msg);
}
