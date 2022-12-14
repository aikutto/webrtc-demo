const {createApp} = Vue;
createApp({
    data() {
        return {
            username: null,
            socket: io(),
            setUsernameForm: {
                username: null,
            },
            setUsernameFormErrorMessage: 'Please provide a username.',
            pc: null,
            usernameToCall: null,
            callUsernameForm: {
                username: null,
            },
            callUsernameFormErrorMessage: '',
            tracks: []
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
                this.socket.emit('call', this.callUsernameForm.username);
            }
        }
    },
    mounted() {
        this.socket.on('set-username-response', (data) => {
                if (data.success) {
                    this.username = data.username;
                    navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: true,
                    }).then((stream) => {
                        document.getElementById('local-video').srcObject = stream;
                        this.pc = new RTCPeerConnection({
                            iceServers: [
                                {urls: 'stun:stun.l.google.com:19302'},
                                {urls: 'stun:stun1.l.google.com:19302'},
                                {urls: 'stun:stun2.l.google.com:19302'},
                                {urls: 'stun:stun3.l.google.com:19302'},
                                {urls: 'stun:stun4.l.google.com:19302'},
                                {urls: 'stun:stunserver.org'},]
                        });
                        stream.getTracks().forEach((track) => {
                            this.pc.addTrack(track);
                        });
                        this.pc.onicecandidate = (e) => {
                            this.socket.emit('exchange', {
                                username: this.usernameToCall,
                                candidate: e.candidate
                            });
                        };
                        this.pc.ontrack = (e) => {
                            this.tracks.push(e.track);
                            document.getElementById('remote-video').srcObject = new MediaStream(this.tracks);
                        };
                    }).catch((reason)=>{
                        alert(reason);
                    });
                } else {
                    this.setUsernameFormErrorMessage = data.message;
                }
            }
        );
        this.socket.on('call-response', (data) => {
            if (data.success) {
                this.usernameToCall = data.username;
                this.pc.createOffer().then((sdp) => {
                    this.pc.setLocalDescription(sdp);
                    this.socket.emit('make-offer', {
                        username: data.username,
                        sdp: sdp
                    });
                });
            } else {
                this.callUsernameFormErrorMessage = data.message;
            }
        });
        this.socket.on('call', (data) => {
            this.usernameToCall = data.username;
            this.pc.setRemoteDescription(data.user.sdp);
            this.pc.createAnswer().then((sdp) => {
                this.pc.setLocalDescription(sdp);
                this.socket.emit('make-answer', {
                    username: data.username,
                    sdp: sdp
                });
            });
        });
        this.socket.on('make-answer-response', (data) => {
            this.pc.setRemoteDescription(data.user.sdp);
        });
        this.socket.on('exchange', (candidate) => {
            if (candidate) {
                this.pc.addIceCandidate(candidate);
            }
        });
    }
}).mount('#app');