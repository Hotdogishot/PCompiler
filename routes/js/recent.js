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
                if (app.todelete.length > 0)
                {
                    app.todelete.remove(data.key)
                    if (app.todelete.length == 0)
                    {
                        app.toggle_appbar(false);
                        snackbar.labelText = `All selected files was deleted successfully.`
                        snackbar.open()
                        app.loading(false)
                    }
                }
                else
                {
                    snackbar.open()
                    app.loading(false)
                }
            }
        });
    },
    methods: {
        timeSince: function(date) {
            date = date.split(' ');
            d1 = date[0].replace(/^(\d{1,2}\/)(\d{1,2}\/)(\d{4})$/,"$2$1$3");
            date = new Date(d1 + ' ' + date[1]);
            
            var seconds = Math.floor((new Date() - date) / 1000);
          
            var interval = seconds / 31536000;
          
            if (interval > 1) {
              return Math.floor(interval) + " years ago";
            }
            interval = seconds / 2592000;
            if (interval > 1) {
              return Math.floor(interval) + " months ago";
            }
            interval = seconds / 86400;
            if (interval > 1) {
              return Math.floor(interval) + " days ago";
            }
            interval = seconds / 3600;
            if (interval > 1) {
              return Math.floor(interval) + " hours ago";
            }
            interval = seconds / 60;
            if (interval > 1) {
              return Math.floor(interval) + " minutes ago";
            }
            return Math.floor(seconds) + " seconds ago";
        },
        toggle_appbar: function(display = true){
            if (!display) {
                checkboxes = document.querySelectorAll('[type="checkbox"]:checked');
                    checkboxes.forEach(item => {
                        item.checked = false;
                    });
                this.count_files = 0;
                this.$refs['appbar'].style.display = "none";
            }
            else
                this.$refs['appbar'].style.display = "block";
        },
        listener: function() {
            that = this;
            checkboxes = document.querySelectorAll('[type="checkbox"]');
            checkboxes.forEach(item => {
                item.addEventListener('change', function() {
                    if (item.checked) {
                        that.todelete.push(item.value)
                    } else {
                        that.todelete.remove(item.value)
                    }
                    that.toggle_appbar(that.todelete.length > 0)
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
            this.todelete.forEach(item => {
                this.deleteforever(item);
            });
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
        todelete: [],
        count_files: 0
    }
})