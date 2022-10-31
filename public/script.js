const { createApp } = Vue;
createApp({
    data() {
        return {
            username: null,
            socket: io(),
            setUsernameForm: {
                username: null,
            },
            setUsernameFormErrorMessage: 'Please provide an username.',

        };
    },
    methods: {
        setUsername() {
            fetch('/set-username', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: this.setUsernameForm.username,
                    socketId: this.socket.id,
                })
            }).then((res) => res.json())
                .then((data) => {
                    if(data.success){
                        this.username = data.username;
                    } else {
                        this.setUsernameFormErrorMessage = data.message;
                    }
                });
        }
    },
    mounted() {

    }
}).mount('#app');