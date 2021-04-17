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
"use strict";

CodeMirror.defineMode("pascal", function() {
  function words(str) {
    var obj = {}, words = str.split(" ");
    for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
    return obj;
  }
  var keywords = words(
    'and array asm begin case class const constructor destructor div do downto else end except exports file finalization finally for goto if implementation in inherited initialization interface label library mod nil not object of or packed program property raise record repeat set shl shr string then to try type unit until uses var while with xor function procedure abs absolute addr append arctan assembler assign assigncrt blockread blockwrite boolean byte char chdir chr close clreol clrscr concat copy cos createdir crt cseg cursorto dec delay delete diskfree disksize dispose donewincrt dosversion double dseg eof eoln erase exit exp export external false far fileexpand filepos filesearch filesize filesplit fillchar findfirst findnext flush forward frac freemem getargcount getargstr getcurdir getdate getdir getenvvar getfattr getftime getmem gettime getverify gotoxy halt hi inc index initwincrt insert int integer interrupt ioresult keypressed length ln lo longint maxavail mkdir move name near new odd ofs ord packtime paramcount paramstr pi pos pred private ptr random randomize read readbuf readkey readln real removedir rename reset resident rewrite rmdir round runerror scrollto seek seekeof seekeoln seg setcurdir setdate setfattr setftime settextbuf settime setverify shortint sin sizeof sqr sqrt str succ swap text trackcursor true trunc truncate unpacktime upcase val virtual wherex wherey wincrt windos word write writebuf writechar writeln And Array Asm Begin Case Class Const Constructor Destructor Div Do DownTo Else End Except Exports File Finalization Finally For Goto If Implementation In Inherited Initialization Interface Label Library Mod Nil Not Object Of Or Packed Program Property Raise Record Repeat Set Shl Shr String Then To Try Type Unit Until Uses Var While With Xor Function Procedure Abs Absolute Addr Append ArcTan Assembler Assign AssignCrt BlockRead BlockWrite Boolean Byte Char ChDir Chr Close ClrEOL ClrScr Concat Copy Cos CreateDir Crt CSeg CursorTo Dec Delay Delete DiskFree DiskSize Dispose DoneWinCRT DosVersion Double DSeg Eof Eoln Erase Exit Exp Export External False Far FileExpand FilePos FileSearch FileSize FileSplit FillChar FindFirst FindNext Flush Forward Frac FreeMem GetArgCount GetArgStr GetCurDir GetDate GetDir GetEnvVar GetFAttr GetFTime GetMem GetTime GetVerify GotoXY Halt Hi Inc Index InitWinCrt Insert Int Integer Interrupt IOResult KeyPressed Length Ln Lo LongInt MaxAvail MkDir Move Name Near New Odd Ofs Ord PackTime ParamCount ParamStr Pi Pos Pred Private Ptr Random Randomize Read ReadBuf ReadKey Readln Real RemoveDir Rename Reset Resident ReWrite RmDir Round RunError ScrollTo Seek SeekEof SeekEoln Seg SetCurDir SetDate SetFAttr SetFTime SetTextBuf SetTime SetVerify Shortint Sin SizeOf Sqr Sqrt Str Succ Swap Text TrackCursor True Trunc Truncate UnpackTime Upcase Val Virtual WhereX WhereY WinCrt WinDos Word Write WriteBuf WriteChar WriteLn'
    );
  var atoms = {"null": true};

  var isOperatorChar = /[+\-*&%=<>!?|\/]/;

  function tokenBase(stream, state) {
    var ch = stream.next();
    if (ch == "#" && state.startOfLine) {
      stream.skipToEnd();
      return "meta";
    }
    if (ch == '"' || ch == "'") {
      state.tokenize = tokenString(ch);
      return state.tokenize(stream, state);
    }
    if (ch == "(" && stream.eat("*")) {
      state.tokenize = tokenComment;
      return tokenComment(stream, state);
    }
    if (ch == "{") {
      state.tokenize = tokenCommentBraces;
      return tokenCommentBraces(stream, state);
    }
    if (/[\[\]\(\),;\:\.]/.test(ch)) {
      return null;
    }
    if (/\d/.test(ch)) {
      stream.eatWhile(/[\w\.]/);
      return "number";
    }
    if (ch == "/") {
      if (stream.eat("/")) {
        stream.skipToEnd();
        return "comment";
      }
    }
    if (isOperatorChar.test(ch)) {
      stream.eatWhile(isOperatorChar);
      return "operator";
    }
    stream.eatWhile(/[\w\$_]/);
    var cur = stream.current();
    if (keywords.propertyIsEnumerable(cur)) return "keyword";
    if (atoms.propertyIsEnumerable(cur)) return "atom";
    return "variable";
  }

  function tokenString(quote) {
    return function(stream, state) {
      var escaped = false, next, end = false;
      while ((next = stream.next()) != null) {
        if (next == quote && !escaped) {end = true; break;}
        escaped = !escaped && next == "\\";
      }
      if (end || !escaped) state.tokenize = null;
      return "string";
    };
  }

  function tokenComment(stream, state) {
    var maybeEnd = false, ch;
    while (ch = stream.next()) {
      if (ch == ")" && maybeEnd) {
        state.tokenize = null;
        break;
      }
      maybeEnd = (ch == "*");
    }
    return "comment";
  }

  function tokenCommentBraces(stream, state) {
    var ch;
    while (ch = stream.next()) {
      if (ch == "}") {
        state.tokenize = null;
        break;
      }
    }
    return "comment";
  }

  // Interface

  return {
    startState: function() {
      return {tokenize: null};
    },

    token: function(stream, state) {
      if (stream.eatSpace()) return null;
      var style = (state.tokenize || tokenBase)(stream, state);
      if (style == "comment" || style == "meta") return style;
      return style;
    },

    electricChars: "{}"
  };
});

CodeMirror.defineMIME("text/x-pascal", "pascal");

});
