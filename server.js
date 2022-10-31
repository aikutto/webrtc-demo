const express = require('express');
const app = express();
const parser = require('body-parser');

app.use(express.static('public'));
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

let users = {};

app.post('/set-username', (req, res) => {
    console.log(users);
    if (!users[req.body.username]) {
        users[req.body.username] = {
            socketId: req.body.socketId
        };
        res.json({
            success: true,
            username: req.body.username
        });
    } else {
        res.json({
            success: false,
            message: `Username ${req.body.username} is already taken.`
        });
    }
});

const server = app.listen(3000, () => {
    console.log('listening on *:3000');
});
const { Server } = require('socket.io');
const io = new Server(server);

io.on('connection', (socket) => {
    console.log(socket.id + ' connnected...');
    socket.on('disconnect', () => {
        Object.keys(users).forEach((username) => {
            if (users[username].socketId == socket.id) {
                delete users[username];
                console.log(users);
            }
        });
    });
});