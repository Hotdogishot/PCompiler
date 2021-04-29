var app = new Vue({
    el: '#app',
    delimiters: ['[[', ']]'],
    mounted() {
        this.socket = io.connect('/websocket');
        // Establish a new connection
        this.socket.emit('create_connection')
        this.socket.on('recent', function(data) {
            app.items = data.files;
            app.loading(false);
            app.$nextTick(() => {
                loadcomponents();
                app.listener();
            });
        })
        this.getData()
        this.socket.on('delete', function(data){
            if (data.status == true) {
                snackbar.labelText = `${data.filename}.pas was deleted successfully.`
                app.$refs[data.key][0].remove();
                for (var i =0; i < app.items.length; i++)
                    if (app.items[i].key == data.key)
                    {
                        app.items.remove(app.items[i])
                        break;
                    }
                snackbar.open()
            }
            app.loading(false)
        });
    },
    methods: {
        toggle_appbar: function(display = true){
            if (!display)
                this.$refs['appbar'].style.display = "none";
            else
                this.$refs['appbar'].style.display = "block";
        },
        listener: function() {
            that = this;
            checkboxes = document.querySelectorAll('[type="checkbox"]');
            checkboxes.forEach(item => {
                item.addEventListener('change', function() {
                    if (item.checked) {
                        that.count_files++;
                    } else {
                        that.count_files--;
                    }
                    that.toggle_appbar(that.count_files > 0)
                })
            });
        },
        newfile: function() {
            this.loading();
            window.location.href = "/generate_new_uid";
        },
        redirect: function(e) {
            window.location.href = `/editor/${e}`
        },
        loading: function(bool = true) {
            let loader = document.querySelector('.loading');
            if (!bool) {
                loader.style.display = "none"
                document.querySelector('.dialog--content').classList.remove("on-progress")
            } else {
                loader.style.display = "block"
                document.querySelector('.dialog--content').classList.add("on-progress")
            }
        },
        
        getData: function() {
            this.loading();
            this.socket.emit('api', {
            command:'recent',
            });
        },
        mass_delete: function() {
            that = this;
            checkboxes = document.querySelectorAll('[type="checkbox"]:checked');
            checkboxes.forEach(item => {
                this.loading();
                that.count_files = that.count_files - checkboxes.length;
                this.deleteforever(item.value);
            });
            this.toggle_appbar(false);
        },
        deleteforever: function(key) {
            this.loading();
            this.socket.emit('api', {command:'delete', key: key});
        },
        toggle_theme: function() {
            var xhttp = new XMLHttpRequest();
            xhttp.open("GET", `/theme/${document.body.classList[0]}`, true);
            xhttp.send();
            if (document.body.classList[0] == 'theme--light') {
                document.body.classList.remove("theme--light")
                document.body.classList.add("theme--dark")
            } else {
                document.body.classList.remove("theme--dark")
                document.body.classList.add("theme--light")
            }
        }
    }, 
    data: {
        items: [],
        count_files: 0
    }
})