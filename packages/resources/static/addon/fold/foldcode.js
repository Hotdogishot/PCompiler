(function(d){"object"==typeof exports&&"object"==typeof module?d(require("../../lib/codemirror")):"function"==typeof define&&define.amd?define(["../../lib/codemirror"],d):d(CodeMirror)})(function(d){function p(a,b,c,e){function g(l){var h=q(a,b);if(!h||h.to.line-h.from.line<u)return null;for(var n=a.findMarksAt(h.from),m=0;m<n.length;++m)if(n[m].__isFold&&"fold"!==e){if(!l)return null;h.cleared=!0;n[m].clear()}return h}if(c&&c.call){var q=c;c=null}else q=k(a,c,"rangeFinder");"number"==typeof b&&(b=
  d.Pos(b,0));var u=k(a,c,"minFoldSize"),f=g(!0);if(k(a,c,"scanUp"))for(;!f&&b.line>a.firstLine();)b=d.Pos(b.line-1,0),f=g(!1);if(f&&!f.cleared&&"unfold"!==e){var r=v(a,c,f);d.on(r,"mousedown",function(l){t.clear();d.e_preventDefault(l)});var t=a.markText(f.from,f.to,{replacedWith:r,clearOnEnter:k(a,c,"clearOnEnter"),__isFold:!0});t.on("clear",function(l,h){d.signal(a,"unfold",a,l,h)});d.signal(a,"fold",a,f.from,f.to)}}function v(a,b,c){a=k(a,b,"widget");"function"==typeof a&&(a=a(c.from,c.to));"string"==
  typeof a?(c=document.createTextNode(a),a=document.createElement("span"),a.appendChild(c),a.className="CodeMirror-foldmarker"):a&&(a=a.cloneNode(!0));return a}function k(a,b,c){return b&&void 0!==b[c]?b[c]:(a=a.options.foldOptions)&&void 0!==a[c]?a[c]:w[c]}d.newFoldFunction=function(a,b){return function(c,e){p(c,e,{rangeFinder:a,widget:b})}};d.defineExtension("foldCode",function(a,b,c){p(this,a,b,c)});d.defineExtension("isFolded",function(a){a=this.findMarksAt(a);for(var b=0;b<a.length;++b)if(a[b].__isFold)return!0});
  d.commands.toggleFold=function(a){a.foldCode(a.getCursor())};d.commands.fold=function(a){a.foldCode(a.getCursor(),null,"fold")};d.commands.unfold=function(a){a.foldCode(a.getCursor(),null,"unfold")};d.commands.foldAll=function(a){a.operation(function(){for(var b=a.firstLine(),c=a.lastLine();b<=c;b++)a.foldCode(d.Pos(b,0),null,"fold")})};d.commands.unfoldAll=function(a){a.operation(function(){for(var b=a.firstLine(),c=a.lastLine();b<=c;b++)a.foldCode(d.Pos(b,0),null,"unfold")})};d.registerHelper("fold",
  "combine",function(){var a=Array.prototype.slice.call(arguments,0);return function(b,c){for(var e=0;e<a.length;++e){var g=a[e](b,c);if(g)return g}}});d.registerHelper("fold","auto",function(a,b){for(var c=a.getHelpers(b,"fold"),e=0;e<c.length;e++){var g=c[e](a,b);if(g)return g}});var w={rangeFinder:d.fold.auto,widget:"... add_box ...",minFoldSize:0,scanUp:!1,clearOnEnter:!0};d.defineOption("foldOptions",null);d.defineExtension("foldOption",function(a,b){return k(this,a,b)})});