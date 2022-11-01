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

io.on('connection', (socket) => {
    socket.on('disconnect', () => {
        Object.keys(users).forEach((username) => {
            if (users[username].socketId === socket.id) {
                delete users[username];
            }
        });
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
});