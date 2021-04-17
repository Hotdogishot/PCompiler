// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  var Pos = CodeMirror.Pos;

  function forEach(arr, f) {
    for (var i = 0, e = arr.length; i < e; ++i) f(arr[i]);
  }

  function arrayContains(arr, item) {
    if (!Array.prototype.indexOf) {
      var i = arr.length;
      while (i--) {
        if (arr[i] === item) {
          return true;
        }
      }
      return false;
    }
    return arr.indexOf(item) != -1;
  }

  function scriptHint(editor, keywords, getToken, options) {
    // Find the token at the cursor
    var cur = editor.getCursor(), token = getToken(editor, cur);
    if (/\b(?:string|comment)\b/.test(token.type)) return;
    var innerMode = CodeMirror.innerMode(editor.getMode(), token.state);
    if (innerMode.mode.helperType === "json") return;
    token.state = innerMode.state;

    // If it's not a 'word-style' token, ignore the token.
    if (!/^[\w$_]*$/.test(token.string)) {
      token = {start: cur.ch, end: cur.ch, string: "", state: token.state,
               type: token.string == "." ? "property" : null};
    } else if (token.end > cur.ch) {
      token.end = cur.ch;
      token.string = token.string.slice(0, cur.ch - token.start);
    }

    var tprop = token;
    // If it is a property, find out what it is a property of.
    while (tprop.type == "property") {
      tprop = getToken(editor, Pos(cur.line, tprop.start));
      if (tprop.string != ".") return;
      tprop = getToken(editor, Pos(cur.line, tprop.start));
      if (!context) var context = [];
      context.push(tprop);
    }
    return {list: getCompletions(token, context, keywords, options),
            from: Pos(cur.line, token.start),
            to: Pos(cur.line, token.end)};
  }

  function pascalHint(editor, options) {
    return scriptHint(editor, pascalKeywords,
                      function (e, cur) {return e.getTokenAt(cur);},
                      options);
  };
  CodeMirror.registerHelper("hint", "pascal", pascalHint);


  var pascalKeywords = ["and",
  "integer",
  "array",
  "asm",
  "begin",
  "case",
  "class",
  "const",
  "constructor",
  "destructor",
  "div",
  "do",
  "downto",
  "else",
  "end",
  "except",
  "exports",
  "file",
  "finalization",
  "finally",
  "for",
  "goto",
  "if",
  "implementation",
  "in",
  "inherited",
  "initialization",
  "interface",
  "label",
  "library",
  "mod",
  "nil",
  "not",
  "object",
  "of",
  "or",
  "packed",
  "program",
  "property",
  "raise",
  "record",
  "repeat",
  "set",
  "shl",
  "shr",
  "string",
  "then",
  "to",
  "try",
  "type",
  "unit",
  "until",
  "uses",
  "var",
  "while",
  "with",
  "xor",
   "function",
   "procedure",
    "abs",
    "absolute",
    "addr",
    "append",
    "arctan",
    "assembler",
    "assign",
    "assigncrt",
    "blockread",
    "blockwrite",
    "boolean",
    "byte",
    "char",
    "chdir",
    "chr",
    "close",
    "clreol",
    "clrscr",
    "concat",
    "copy",
    "cos",
    "createdir",
    "crt",
    "cseg",
    "cursorto",
    "dec",
    "delay",
    "delete",
    "diskfree",
    "disksize",
    "dispose",
    "donewincrt",
    "dosversion",
    "double",
    "dseg",
    "eof",
    "eoln",
    "erase",
    "exit",
    "exp",
    "export",
    "external",
    "false",
    "far",
    "fileexpand",
    "filepos",
    "filesearch",
    "filesize",
    "filesplit",
    "fillchar",
    "findfirst",
    "findnext",
    "flush",
    "forward",
    "frac",
    "freemem",
    "getargcount",
    "getargstr",
    "getcurdir",
    "getdate",
    "getdir",
    "getenvvar",
    "getfattr",
    "getftime",
    "getmem",
    "gettime",
    "getverify",
    "gotoxy",
    "halt",
    "hi",
    "inc",
    "index",
    "initwincrt",
    "insert",
    "int",
    "interrupt",
    "ioresult",
    "keypressed",
    "length",
    "ln",
    "lo",
    "longint",
    "maxavail",
    "mkdir",
    "move",
    "name",
    "near",
    "new",
    "odd",
    "ofs",
    "ord",
    "packtime",
    "paramcount",
    "paramstr",
    "pi",
    "pos",
    "pred",
    "private",
    "ptr",
    "random",
    "randomize",
    "read",
    "readbuf",
    "readkey",
    "readln",
    "real",
    "removedir",
    "rename",
    "reset",
    "resident",
    "rewrite",
    "rmdir",
    "round",
    "runerror",
    "scrollto",
    "seek",
    "seekeof",
    "seekeoln",
    "seg",
    "setcurdir",
    "setdate",
    "setfattr",
    "setftime",
    "settextbuf",
    "settime",
    "setverify",
    "shortint",
    "sin",
    "sizeof",
    "sqr",
    "sqrt",
    "str",
    "succ",
    "swap",
    "text",
    "trackcursor",
    "true",
    "trunc",
    "truncate",
    "unpacktime",
    "upcase",
    "val",
    "virtual",
    "wherex",
    "wherey",
    "wincrt",
    "windos",
    "word",
    "writeln",
    "writebuf",
    "writechar",
    "write"];
  function forAllProps(obj, callback) {
    if (!Object.getOwnPropertyNames || !Object.getPrototypeOf) {
      for (var name in obj) callback(name)
    } else {
      for (var o = obj; o; o = Object.getPrototypeOf(o))
        Object.getOwnPropertyNames(o).forEach(callback)
    }
  }

  function getCompletions(token, context, keywords, options) {
    var found = [], start = token.string, global = options && options.globalScope || window;
    function maybeAdd(str) {
      if (str.lastIndexOf(start, 0) == 0 && !arrayContains(found, str)) found.push(str);
    }
    function gatherCompletions(obj) {
      if (obj instanceof Function) forEach(pascalKeywords, maybeAdd);
    }
    if (token.string != "") {
      // If not, just look in the global object, any local scope, and optional additional-context
      // (reading into JS mode internals to get at the local and global variables)
      for (var v = token.state.localVars; v; v = v.next) maybeAdd(v.name);
      for (var c = token.state.context; c; c = c.prev)
        for (var v = c.vars; v; v = v.next) maybeAdd(v.name)
      for (var v = token.state.globalVars; v; v = v.next) maybeAdd(v.name);
      if (options && options.additionalContext != null)
        for (var key in options.additionalContext)
          maybeAdd(key);
      if (!options || options.useGlobalScope !== false)
        gatherCompletions(global);
      forEach(keywords, maybeAdd);
    }
    
    
    return found;
  }
});
