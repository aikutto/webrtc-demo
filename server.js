const express = require('express');
const app = express();
const parser = require('body-parser');

app.use(express.static('public'));
app.use(parser.json());
app.use(parser.urlencoded({extended: true}));

let users = {};

const server = app.listen(3000, () => {
    console.log('listening on *:3000');
});
const {Server} = require('socket.io');
const io = new Server(server);

const getUsernameBySocketId = (socketId) => {
    for (const username of Object.keys(users)) {
        if (users[username].socketId === socketId) {
            return username;
        }
    }
    return null;
}

io.on('connection', (socket) => {
    socket.on('disconnect', () => {
        const username = getUsernameBySocketId(socket.id);
        if (username) {
            delete users[username];
        }
    });
    socket.on('set-username', (username) => {
        if (!users[username]) {
            users[username] = {
                socketId: socket.id
            };
            socket.emit('set-username-response', {
                success: true,
                username: username
            });
        } else {
            socket.emit('set-username-response', {
                success: false,
                message: `Username ${username} is already taken.`
            });
        }
    });
    socket.on('call', (username) => {
        if (users[username]) {
            if (!users[username].isBusy) {
                socket.emit('call-response', {
                    success: true,
                    username: username
                });
            } else {
                socket.emit('call-response', {
                    success: false,
                    message: `${username} is busy.`
                });
            }
        } else {
            socket.emit('call-response', {
                success: false,
                message: `${username} not found.`
            });
        }
    });
    socket.on('make-offer', (data) => {
        const username = getUsernameBySocketId(socket.id);
        if (username) {
            users[username]['sdp'] = data.sdp;

        }
    });
});