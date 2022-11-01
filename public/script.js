const {createApp} = Vue;
createApp({
    data() {
        return {
            username: null,
            socket: io(),
            setUsernameForm: {
                username: null,
            },
            setUsernameFormErrorMessage: 'Please provide an username.',
            pc: null,
            usernameToCall: null,
            callUsernameForm: {
                username: null,
            },
            callUsernameFormErrorMessage: '',
        };
    },
    methods: {
        setUsername() {
            this.socket.emit('set-username', this.setUsernameForm.username);
        },
        callUsername() {
            if (this.setUsernameForm.username === this.callUsernameForm.username) {
                this.callUsernameFormErrorMessage = 'You can not call yourself.';
            } else {

            }
        }
    },
    mounted() {
        this.socket.on('set-username-response', (data) => {
                if (data.success) {
                    this.username = data.username;
                    this.pc = new RTCPeerConnection({
                        iceServers: [
                            {urls: 'stun:stun.l.google.com:19302'},
                            {urls: 'stun:stun1.l.google.com:19302'},
                            {urls: 'stun:stun2.l.google.com:19302'},
                            {urls: 'stun:stun3.l.google.com:19302'},
                            {urls: 'stun:stun4.l.google.com:19302'},
                            {urls: 'stun:stunserver.org'},]
                    });
                    navigator.mediaDevices.getUserMedia({
                        // video: true,
                        audio: true,
                    }).then((stream) => {
                        stream.getTracks().forEach((track) => {
                            this.pc.addTrack(track);
                        });
                    });
                } else {
                    this.setUsernameFormErrorMessage = data.message;
                }
            }
        );
    }
}).mount('#app');