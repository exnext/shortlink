var app = new Vue({
    el: '#app',
    data: () => {
        let config = {};

        axios.get(window.location.origin + '/config')
            .then((result) => {
                Object.assign(config, result.data);
            });

        return {
            url: undefined,
            link: undefined,
            showRecaptcha: false,
            working: false,
            config
        }
    },
    components: {
        'vue-recaptcha': VueRecaptcha
    },
    methods: {
        createUrl(recaptchaToken) {
            this.working = true;
            axios.post(window.location.origin, { url: this.url, recaptchaToken: recaptchaToken })
                .then((result) => {
                    this.url = undefined;
                    this.link = window.location.origin + '/' + result.data.tag;
                })
                .catch((error) => {
                    console.log(error);
                })
                .finally(() => {
                    this.working = false;    
                });
        },
        submit() {
            if (this.config.recaptcha && this.config.recaptcha.siteKey) {
                this.showRecaptcha = true;
            } else {
                this.createUrl();
            }
        },
        newAddress() {
            this.link = undefined;
            this.showRecaptcha = false;
        },
        onCaptchaVerified(recaptchaToken) {
            this.$refs.recaptcha.reset();
            this.createUrl(recaptchaToken);
        },
        onCaptchaExpired: function () {
            this.$refs.recaptcha.reset();
        }
    }
})