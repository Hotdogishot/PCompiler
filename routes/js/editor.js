var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.createTemplateTagFirstArg=function(a){return a.raw=a};$jscomp.createTemplateTagFirstArgWithRaw=function(a,b){a.raw=b;return a};
var app=new Vue({el:"#app",delimiters:["[[","]]"],mounted:function(){this.filekey=this.$refs.filename.getAttribute("file-key");this.bootstrap();this.getRecent();this.listener()},data:{filekey:null,socket:null,errors:[],recents:[]},methods:{updateTabs:function(a){var b=this,c=this.getCookie("recents");c=""!==c?JSON.parse(c):[];c.includes(this.filekey)||c.push(this.filekey);a.forEach(function(d){c.includes(d.key)&&(delete d.content,b.recents.push(d))});this.setCookie("recents",JSON.stringify(c),6E3);
this.$nextTick(function(){loadcomponents();b.navigate(b.filekey)})},getRecent:function(){var a=io.connect("/websocket");a.emit("create_connection");a.emit("api",{command:"recent"});a.on("recent",function(b){app.updateTabs(b.files);a.close()})},updateEditor:function(){this.loading();this.socket.emit("api",{command:"get",key:this.filekey})},index:function(a){id=document.querySelector('[tab-key="'+a+'"]').id;id=Number(id.replace("mdc-tab-",""));return id-1},navigate:function(a){curr_page=document.location.href.split("/");
curr_page[curr_page.length-1]=a;window.history.pushState({pageTitle:""},"",curr_page.join("/"));tabs.activateTab(this.index(a));this.filekey=a;this.bootstrap()},listener:function(){that=this;window.addEventListener("wheel",function(a){a.altKey&&(0>a.deltaY?that.zoom("in"):that.zoom("out"))});document.addEventListener("keydown",this.keylistener)},bootstrap:function(){this.connect();this.socket.on("compile",function(a){"compile"==a.arg||"download"==a.arg||"run"==a.arg?(0==a.status?(app.errors=a.output,
app.output(!0)):(snackbar.labelText="Compiled successfully.","download"==a.arg&&saveAs("/secure_storage/"+app.filekey,app.$refs.filename.value+".exe"),app.errors=[],app.output(!1)),app.gutter()):(snackbar.labelText="File successfully saved.",snackbar.open());1==a.status&&snackbar.open();app.loading(!1)});this.socket.on("get",function(a){app.$refs.filename.value=a.filename;app.$refs.filename.setAttribute("file-key",a.key);editor.setValue(a.content);app.loading(!1)});this.socket.on("disconnect",function(){snackbar.labelText=
"You are currently offline.";snackbar.open()});this.socket.on("reconnect",function(){snackbar.labelText="Your internet connection was restored.";app.loading(!1);snackbar.open();app.bootstrap()});""!=this.getCookie("editor_font_size")&&document.body.style.setProperty("--font-size",""+this.getCookie("editor_font_size"));this.updateEditor()},connect:function(){this.socket=io.connect("/websocket");this.socket.emit("create_connection",this.filekey);this.loading(!1)},keylistener:function(a){if(83===a.keyCode&&
(a.ctrlKey||a.metaKey))this.save(a,key=!1);else if(66===a.keyCode&&(a.ctrlKey||a.metaKey))this.builder("compile");else if(70===a.keyCode&&(a.shiftKey||a.metaKey))this.builder("run");else return;a.preventDefault()},toogle_tools:function(){var a=document.querySelector(".tools");"0px"==window.getComputedStyle(a).getPropertyValue("right")?a.style.right="-165px":a.style.right="0px"},zoom:function(a){var b=getComputedStyle(document.body).getPropertyValue("--font-size");b=b.substring(0,b.indexOf("%"));b=
Number(b);"in"==a?430>=b&&(b+=20):80<=b&&(b-=20);document.body.style.setProperty("--font-size",b+"%");this.setCookie("editor_font_size",b+"%",99999);editor.refresh()},gutter:function(){var a=this;for(i=0;i<editor.lineCount();i++){editor.setGutterMarker(i,"CodeMirror-linenumbers",null);try{document.getElementById("line--"+i).remove()}catch(b){}}this.errors.forEach(function(b){if(null!=b.line){var c=editor.lineInfo(b.line);editor.setGutterMarker(b.line,"CodeMirror-linenumbers",c.gutterMarkers?null:
app.makeMarker(b));a.updateTooltips()}})},updateTooltips:function(){try{document.querySelectorAll(".mdc-tooltip").forEach(function(a){new mdc.tooltip.MDCTooltip.attachTo(a)})}catch(a){}},makeMarker:function(a){var b=document.createElement("div");b.className="gutter CodeMirror-linenumber CodeMirror-gutter-elt";b.innerHTML="\u25cf";var c=document.createAttribute("aria-describedby");c.value="line--"+a.line;b.setAttributeNode(c);c=document.createElement("div");c.className="mdc-tooltip";c.id="line--"+
a.line;var d=document.createElement("div");d.className="mdc-tooltip__surface";d.innerText=a.error;c.appendChild(d);document.body.appendChild(c);return b},setCookie:function(a,b,c){var d=new Date;d.setTime(d.getTime()+864E5*c);c="expires="+d.toUTCString();document.cookie=a+"="+b+";"+c+";path=/"},getCookie:function(a){a+="=";for(var b=document.cookie.split(";"),c=0;c<b.length;c++){for(var d=b[c];" "==d.charAt(0);)d=d.substring(1);if(0==d.indexOf(a))return d.substring(a.length,d.length)}return""},newTab:function(){window.location.href=
"/recent"},loading:function(a){a=void 0===a?!0:a;var b=document.querySelector(".loading");a?(b.style.display="block",document.querySelector("#app--editor").classList.add("on-progress")):(b.style.display="none",document.querySelector("#app--editor").classList.remove("on-progress"))},builder:function(a){a=void 0===a?"compile":a;this.loading();this.socket.emit("api",{command:"compile",code:editor.getValue(),filename:this.$refs.filename.value,key:this.filekey,arg:a})},save_as:function(){this.loading();
var a=new Blob([editor.getValue()],{type:"text/x-pascal"});saveAs(a,this.$refs.filename.value+".pas");this.loading(!1)},save:function(a,b){if(void 0===b||b){if(83!==a.keyCode||!a.ctrlKey)return;a.preventDefault()}this.builder(arg="save");document.querySelector('[tab-key="'+this.filekey+'"] .mdc-tab__text-label').innerText=this.$refs.filename.value+".pas"},save_as_menu:function(){menu.open=!0},output:function(a){void 0===a||a?document.querySelector(".output--log").style.display="block":document.querySelector(".output--log").style.display=
"none"},screenshot:function(){html2canvas(document.querySelector(".CodeMirror"),{allowTaint:!0,useCORS:!0,logging:!1,height:window.outerHeight+15,windowHeight:window.outerHeight+window.innerHeight}).then(function(a){a.toBlob(function(b){b=new ClipboardItem({"image/png":b});navigator.clipboard.write([b]);snackbar.labelText="Copied to clipboard!";snackbar.open()})})},new_tab:function(){this.loading();that=this;var a=new XMLHttpRequest;a.onreadystatechange=function(){if(4==this.readyState&&200==this.status){hash=
a.responseURL.split("/");hash=hash[hash.length-1];var b=that.getCookie("recents");b=JSON.parse(b);b.push(hash);that.setCookie("recents",JSON.stringify(b),6E3);that.recents.push({key:hash,filename:"untilted"});that.loading(!1);that.$nextTick(function(){loadcomponents();that.navigate(hash)})}};a.open("GET","/generate_new_uid",!0);a.send()},remove_tab:function(a){if(a!==this.filekey){document.querySelector('[tab-key="'+a+'"]').closest(".tabs").remove();var b=this.getCookie("recents");b=JSON.parse(b);
b.remove(a);this.setCookie("recents",JSON.stringify(b),6E3);this.navigate(b[0])}},toggle_theme:function(){var a=new XMLHttpRequest;a.open("GET","/theme/"+document.body.classList[0],!0);a.send();"theme--light"==document.body.classList[0]?(document.body.classList.remove("theme--light"),document.body.classList.add("theme--dark")):(document.body.classList.remove("theme--dark"),document.body.classList.add("theme--light"))}}}),editor=CodeMirror(document.getElementById("app--editor"),{mode:"text/x-pascal",
value:"uses wincrt;\n\n\nbegin\n\t\nend.",extraKeys:{"Ctrl-Q":function(a){a.foldCode(a.getCursor())}},foldGutter:!0,lineNumbers:!0,lineWrapping:!0,styleActiveLine:!0,gutters:["CodeMirror-linenumbers","CodeMirror-foldgutter"]});editor.setOption("theme","light");editor.on("keyup",function(a,b){a.state.completionActive||13==b.keyCode||CodeMirror.commands.autocomplete(a,null,{completeSingle:!1})});var menu=new mdc.menu.MDCMenu(document.querySelector(".mdc-menu"));dragElement(document.querySelector(".output--log"));
function dragElement(a){function b(e){e=e||window.event;e.preventDefault();f=e.clientX;g=e.clientY;document.onmouseup=d;document.onmousemove=c}function c(e){e=e||window.event;e.preventDefault();h=f-e.clientX;k=g-e.clientY;f=e.clientX;g=e.clientY;a.style.top=a.offsetTop-k+"px";a.style.left=a.offsetLeft-h+"px"}function d(){document.onmouseup=null;document.onmousemove=null}var h=0,k=0,f=0,g=0;document.querySelector(".output--topbar")?document.querySelector(".output--topbar").onmousedown=b:a.onmousedown=
b};
