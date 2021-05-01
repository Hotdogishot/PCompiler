var app = new Vue({
    el: '#app',
    delimiters: ['[[', ']]'],
    mounted() {
        this.filekey = this.$refs["filename"].getAttribute('file-key');
        this.bootstrap();
        this.getRecent();
        this.listener();
    },
    data: {
        filekey: null,
        socket: null,
        errors: [],
        recents: []
    },
    methods: {
        updateTabs: function(files) {
            var recents = this.getCookie('recents');
            if (recents !== "")
                recents = JSON.parse(recents)
            else
                recents = []

            if (!recents.includes(this.filekey)) {
                recents.push(this.filekey);
            }
            files.forEach(file => {
                if (recents.includes(file.key)) {
                    delete file.content
                    this.recents.push(file)
                }
            });
            this.setCookie('recents', JSON.stringify(recents), 6000)
            this.$nextTick(() => {
                loadcomponents();
                this.navigate(this.filekey);
            })
        },
        getRecent: function() {
            var tmpsocket = io.connect('/websocket');
            tmpsocket.emit('create_connection')
            tmpsocket.emit('api', {
                command: 'recent',
            });
            tmpsocket.on('recent', function(data) {
                app.updateTabs(data.files);
                tmpsocket.close();
            })
        },
        updateEditor: function() {
            this.loading();
            this.socket.emit('api', {
                command: 'get',
                key: this.filekey,
            });
        },
        index: function(key) {
            id = document.querySelector(`[tab-key="${key}"]`).id;
            id = Number(id.replace('mdc-tab-', ''))
            return id - 1;
        },
        navigate: function(key) {
            curr_page = document.location.href.split('/');
            curr_page[curr_page.length - 1] = key
            window.history.pushState({
                "pageTitle": ""
            }, "", curr_page.join('/'));
            tabs.activateTab(this.index(key))
            this.filekey = key;
            this.bootstrap();
        },
        listener: function() {
            that = this
            window.addEventListener("wheel", function(event) {
                if (event.altKey) {
                    if (event.deltaY < 0)
                        that.zoom('in')
                    else
                        that.zoom('out')
                }
            });
            document.addEventListener("keydown", this.keylistener);
        },
        bootstrap: function() {
            this.connect();
            this.socket.on('compile', function(data) {
                if ((data.arg == "compile") || (data.arg == "download") || (data.arg == "run")) {
                    if (data.status == false) {
                        app.errors = data.output;
                        app.output(true);
                        app.gutter();
                    } else {
                        snackbar.labelText = "Compiled successfully."
                        if (data.arg == "download")
                            saveAs(`/secure_storage/${app.filekey}`,
                                `${app.$refs["filename"].value}.exe`);
                        app.errors = []; // empty errors list
                        app.output(false);
                        app.gutter() // remove errors
                    }
                } else {
                    snackbar.labelText = "File successfully saved."
                    snackbar.open()
                }
                if (data.status == true)
                    snackbar.open()
                app.loading(false);
            });
            this.socket.on('get', function(data) {
                app.$refs['filename'].value = data.filename;
                app.$refs['filename'].setAttribute("file-key", data.key);
                editor.setValue(data.content)
                app.loading(false);
            })
            this.socket.on("disconnect", () => {
                snackbar.labelText = "You are currently offline."
                snackbar.open()
            });
            this.socket.on("reconnect", () => {
                snackbar.labelText = "Your internet connection was restored."
                app.loading(false);
                snackbar.open()
                app.bootstrap();
            });
            if (this.getCookie('editor_font_size') != "") {
                document.body.style.setProperty('--font-size', `${this.getCookie('editor_font_size')}`);
            }
            // update file
            this.updateEditor();
        },
        connect: function() {
            this.socket = io.connect('/websocket');
            // Establish a new connection
            this.socket.emit('create_connection', this.filekey)
            this.loading(false)
        },
        keylistener: function(e) {
            if ((e.keyCode === 83 && (e.ctrlKey || e.metaKey))) {
                this.save(e, key = false)
            } else if ((e.keyCode === 66 && (e.ctrlKey || e.metaKey))) {
                this.builder('compile')
            } else if ((e.keyCode === 70 && (e.shiftKey || e.metaKey))) {
                this.builder('run')
            } else {
                return;
            }
            e.preventDefault();
        },
        toogle_tools: function() {
            var tools = document.querySelector('.tools'),
                style = window.getComputedStyle(tools),
                right = style.getPropertyValue('right');
            if (right == '0px') {
                tools.style.right = '-165px'
            } else {
                tools.style.right = '0px'
            }
        },
        zoom: function(control) {
            var style = getComputedStyle(document.body)
            var currSize = style.getPropertyValue('--font-size');
            currSize = currSize.substring(0, currSize.indexOf('%'));
            currSize = Number(currSize);
            if (control == 'in') {
                if (currSize <= 430)
                    currSize += 20;
            } else {
                if (currSize >= 80)
                    currSize -= 20;
            }
            document.body.style.setProperty('--font-size', `${currSize}%`);
            this.setCookie('editor_font_size', `${currSize}%`, 99999);
            editor.refresh();
        },
        gutter: function() {
            for (i = 0; i < editor.lineCount(); i++) {
                editor.setGutterMarker(i, "CodeMirror-linenumbers", null)
                try {
                    document.getElementById(`line--${i}`).remove();
                } catch (err) {}
            }
            this.errors.forEach(error => {
                if (error.line != null) {
                    var info = editor.lineInfo(error.line);
                    editor.setGutterMarker(error.line, "CodeMirror-linenumbers", info.gutterMarkers ? null : app.makeMarker(error))
                    this.updateTooltips();
                }
            })
        },
        updateTooltips: function() {
            try {
                document.querySelectorAll('.mdc-tooltip').forEach(item => {
                    new mdc.tooltip.MDCTooltip.attachTo(item);
                });
            } catch (err) {}
        },
        makeMarker: function(error) {
            var marker = document.createElement("div");
            marker.className = "gutter CodeMirror-linenumber CodeMirror-gutter-elt";
            marker.innerHTML = '●';
            // tooltip
            var att = document.createAttribute("aria-describedby");
            att.value = `line--${error.line}`;
            marker.setAttributeNode(att);
            var tooltip = document.createElement("div");
            tooltip.className = "mdc-tooltip";
            tooltip.id = `line--${error.line}`
            var surface = document.createElement("div");
            surface.className = "mdc-tooltip__surface";
            surface.innerText = error.error;
            tooltip.appendChild(surface);
            document.body.appendChild(tooltip)
            return marker
        },
        setCookie: function(cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        },
        getCookie: function(cname) {
            var name = cname + "=";
            var decodedCookie = (document.cookie);
            var ca = decodedCookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        },
        newTab: function() {
            window.location.href = "/recent"
        },
        loading: function(bool = true) {
            let loader = document.querySelector('.loading');
            if (!bool) {
                loader.style.display = "none"
                document.querySelector('#app--editor').classList.remove("on-progress")
            } else {
                loader.style.display = "block"
                document.querySelector('#app--editor').classList.add("on-progress")
            }
        },
        builder: function(arg = "compile") {
            this.loading();
            this.socket.emit('api', {
                command: 'compile',
                code: editor.getValue(),
                filename: this.$refs["filename"].value,
                key: this.filekey,
                arg: arg
            });
        },
        save_as: function() {
            this.loading();
            let blob = new Blob([editor.getValue()], {
                type: 'text/x-pascal'
            });
            saveAs(blob, `${this.$refs["filename"].value}.pas`);
            this.loading(false);
        },
        save(e, key = true) {
            if (key) {
                if (!(e.keyCode === 83 && e.ctrlKey))
                    return;
                e.preventDefault();
            }
            this.builder(arg = "save")
            document.querySelector(`[tab-key="${this.filekey}"] .mdc-tab__text-label`).innerText = `${this.$refs['filename'].value }.pas`
        },
        save_as_menu: function() {
            menu.open = true
        },
        output: function(display = true) {
            if (display)
                document.querySelector('.output--log').style.display = "block";
            else
                document.querySelector('.output--log').style.display = "none";
        },
        screenshot: function() {
            html2canvas(document.querySelector('.CodeMirror'), {
                allowTaint: true,
                useCORS: true,
                logging: false,
                height: window.outerHeight + 15,
                windowHeight: window.outerHeight + window.innerHeight}).then(function(canvas) {
                canvas.toBlob(function(blob){ 
                    const item = new ClipboardItem({ "image/png": blob });
                    navigator.clipboard.write([item]);
                    snackbar.labelText = "Copied to clipboard!"
                    snackbar.open();
                 });
            });
        },
        new_tab: function() {
            
            this.loading();
            that = this;
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    hash = xhttp.responseURL.split('/');
                    hash = hash[hash.length - 1];
                    var recents = that.getCookie('recents');
                    recents = JSON.parse(recents);
                    recents.push(hash);
                    that.setCookie('recents', JSON.stringify(recents), 6000)
                    that.recents.push({
                        key: hash,
                        filename: "untilted"
                    });
                    that.loading(false);
                    that.$nextTick(() => {
                        loadcomponents();
                        that.navigate(hash);
                    })
                }
            };
            xhttp.open("GET", "/generate_new_uid", true);
            xhttp.send();

            // window.location.href = "/generate_new_uid"
        },
        remove_tab: function(key) {
            if (key !== this.filekey) {
                document.querySelector(`[tab-key="${key}"]`).closest('.tabs').remove();
                var recents = this.getCookie('recents');
                recents = JSON.parse(recents);
                recents.remove(key);
                this.setCookie('recents', JSON.stringify(recents), 6000)
            }
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
    }
})
let editor =
    CodeMirror(document.getElementById('app--editor'), {
        mode: "text/x-pascal",
        value: "uses wincrt;\n\n\nbegin\n	\nend.",
        extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
        foldGutter: true,
        lineNumbers: true,
        lineWrapping: true,
        styleActiveLine: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
    });
    
// Set editor theme
editor.setOption('theme', 'light');
// Set key up intellisense
editor.on("keyup", function(cm, event) {
    if (!cm.state.completionActive && /*Enables keyboard navigation in autocomplete list*/
        event.keyCode != 13) {
        /*Enter - do not open autocomplete list just after item has been selected in it*/
        CodeMirror.commands.autocomplete(cm, null, {
            completeSingle: false
        });
    }
});


let menu = new mdc.menu.MDCMenu(document.querySelector('.mdc-menu'));

dragElement(document.querySelector(".output--log"));

function dragElement(elmnt) {
    var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    if (document.querySelector(".output--topbar")) {
        // if present, the header is where you move the DIV from:
        document.querySelector(".output--topbar").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}