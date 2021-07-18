
/* JaxEdit: online LaTeX editor with live preview
 * Copyright (c) 2011-2017 JaxEdit project
 * License: GNU Lesser General Public License, Version 3
 * Source:  https://github.com/zohooo/jaxedit
 */

window.jaxedit = (function($){
    var gatepath = "",
        mathname = "MathJax.js?config=TeX-AMS_HTML",
        mathpath = "",
        shareurl = "";
  
    return {
      autoScroll: false,
      dialogMode: null,
      fileid: 0,
      fileName: "noname.tex",
      hasEditor: false,
      hasParser: false,
      localDrive: false,
      trustHost: false,
      useDrive: null,
      version: "0.40",
      mode: "write",
      view: "half",
      wcode: null,
  
      options: {
        debug: "none",
        highlight: false,
        localjs: false
      },
  
      childs: {
        html : document.documentElement,
        body : document.body,
        wrap : document.getElementById("wrap"),
        head : document.getElementById("head"),
        main : document.getElementById("main"),
        left : document.getElementById("left"),
        ltop : document.getElementById("ltop"),
        source : document.getElementById("source"),
        codearea : document.getElementById("codearea"),
        description : document.getElementById("description"),
        lbot : document.getElementById("lbot"),
        resizer : document.getElementById("resizer"),
        right : document.getElementById("right"),
        rtop : document.getElementById("rtop"),
        preview : document.getElementById("preview"),
        showarea : document.getElementById("showarea"),
        rbot : document.getElementById("rbot")
      },
  
      scrollers: {
        codelength : 0,
        codechange : 0,
        codescroll : 0,
        showscroll : 0,
        showheight : 1,
        divheights : []
      },
  
      textdata: {
        oldtextvalue : "", oldtextsize : 0, oldselstart : 0, oldselend : 0, oldseltext : "",
        newtextvalue : "", newtextsize : 0, newselstart : 0, newselend : 0, newseltext : ""
      },
  
      getOptions: function() {
        var options = this.options, agent = $.agent, browser = agent.browser, version = agent.version;
  
        if (browser == "chrome" || (browser == "firefox" && version >= 3) || (browser == "msie" && version >=8)
                                || (browser == "safari" && version >= 5.2) || (browser == "opera" && version >= 9)) {
          if (!$.has("touch")) {
            options.highlight = true;
          }
        }
  
        options.localjs = (location.protocol == "file:" || location.protocol == "https:" || location.protocol == "http:");
  
        var qs = location.search.length > 0 ? location.search.substring(1) : "";
        var items = qs.split("&"), pair, name, value;
  
        for (var i=0; i<items.length; i++) {
          pair = items[i].split("=");
          if (pair.length == 1) {
            var id = parseInt(pair[0]);
            if (isFinite(id)) this.fileid = id;
            continue;
          }
          name = decodeURIComponent(pair[0]);
          value = pair[1] ? decodeURIComponent(pair[1]) : "";
          switch (typeof options[name]) {
            case "boolean":
              if (value == "true" || value == "1") {
                options[name] = true;
              } else if (value == "false" || value == "0") {
                options[name] = false;
              }
              break;
            case "number":
              value = parseFloat(value);
              if (!isNaN(value)) {
                options[name] = value;
              }
              break;
            case "string":
              options[name] = value;
              break;
          }
        }
  
        mathpath = options.localjs ? "/jaxedit/library/mathjax/unpacked/" : "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/";
        if (location.pathname.slice(0, 6) == "/note/") {
          gatepath = "/gate/"; shareurl = "/note/";
        } else {
          gatepath = "/door/"; shareurl = "/beta/";
        }
        if (/jaxedit/.test(location.hostname)) this.trustHost = true;
      },
  
      /*doResize: function(clientX) {
        var that = this;
        var childs = that.childs,
            html = childs.html,
            body = childs.body,
            left = childs.left,
            resizer = childs.resizer,
            right = childs.right,
            preview = childs.preview,
            showarea = childs.showarea;
  
        var pageWidth = window.innerWidth;
        var pageHeight = window.innerHeight;
        console.log(pageWidth);
        console.log(pageHeight);
        if (typeof pageWidth != "number" ){
           if (document.compatMode == "CSS1Compat"){
              pageWidth = document.documentElement.clientWidth;
              pageHeight = document.documentElement.clientHeight;
           } else {
              pageWidth = document.body.clientWidth;
              pageHeight = document.body.clientHeight;
           }
        }
  
        if (typeof clientX == "number") { // resizer
          if (clientX < 80) clientX = 2;
          if (pageWidth - clientX < 80) clientX = pageWidth - 2;
          left.style.right = pageWidth - clientX + "px";
          right.style.left = clientX + "px";
          resizer.style.left = clientX - 2 + "px";
          return;
        } else {
          left.removeAttribute("style"); right.removeAttribute("style"); resizer.removeAttribute("style");
          preview.removeAttribute("style"); showarea.removeAttribute("style");
        }
  
        //var view = this.view;
        //if (pageWidth > 540 && (view == "code" || view == "show")) {
        //  this.view = "half";
        //} else if (pageWidth <= 540 && (view == "half") && !($.agent.browser == "msie" && $.agent.version < 9)) {
        //  this.view = "code";
        //}
  
        html.id = "view-" + this.view;
      },*/
  
      loadEditor: function() {
        var that = this;
        if (this.options.highlight) {
          $.loadStyles("/jaxedit/library/codemirror/lib/codemirror.css");
          $.loadScript("/jaxedit/editor/textarea/colorful.js", function(){
            $.loadScript("/jaxedit/library/codemirror/lib/codemirror.js", function(){
              $.loadScript("/jaxedit/library/codemirror/mode/stex/stex.js", function(){
                $.loadScript("/jaxedit/library/codemirror/addon/edit/matchbrackets.js", function(){
                  that.addEditor();
                  that.hasEditor = true;
                  that.initialize();
                });
              });
            });
          });
        } else {
          $.loadScript("/jaxedit/editor/textarea/simple.js", function(){
            that.addEditor();
            that.hasEditor = true;
            that.initialize();
          });
        }
      },
  
      loadParser: function() {
        var that = this;
        var script = document.createElement("script");
        script.type = "text/x-mathjax-config";
        script[(window.opera ? "innerHTML" : "text")] =
          "MathJax.Hub.Config({\n" +
          "  skipStartupTypeset: true,\n" +
          "  TeX: { extensions: ['color.js', 'extpfeil.js'] },\n" +
          "  'HTML-CSS': { imageFont: null }\n" +
          "});"
        document.body.appendChild(script);
        
        $.loadStyles("/jaxedit/typejax/typejax.css");
        $.loadScript("/jaxedit/typejax/typejax.js", function(){
          $.loadScript(mathpath + mathname, function(){
            MathJax.Hub.processUpdateTime = 200;
            MathJax.Hub.processUpdateDelay = 15;
            that.hasParser = true;
            that.initialize();
            that.autoScroll = true;
          });
        });
      },
  
      initialize: function() {
        if (this.hasEditor && this.hasParser) {
          this.initEditor();
        }
      },
  
      initEditor: function(value) {
        var childs = this.childs,
            codearea = childs.codearea,
            lbot = childs.lbot,
            showarea = childs.showarea;
        var editor = this.editor,
            scrollers = this.scrollers,
            data = this.textdata;
        var highlight = this.options.highlight;
  
        if (!highlight && $.agent.browser == "msie") codearea.setActive();
  
        if (typeof value == "string") {
          editor.setValue(value);
        }
        data.newtextvalue = editor.getValue();
        data.newtextsize = data.newtextvalue.length;
        if (!highlight) {
          data.newselstart = codearea.selectionStart;
          data.newselend = codearea.selectionEnd;
        }
  
        lbot.innerHTML = "size: " + data.newtextsize;
        scrollers.codelength = data.newtextsize;
        scrollers.codechange = 0;
        scrollers.codescroll = 0;
        scrollers.showscroll = 0;
        scrollers.showheight = 1;
        scrollers.divheights = [];
  
        editor.setReadOnly(true);
        this.addHooks();
        typejax.message.debug = this.options.debug;
        typejax.updater.init(data.newtextvalue, data.newtextsize, showarea);
        //typejax.updater.init(data.newtextvalue, data.newtextsize, description);
        this.addHandler();
        editor.setReadOnly(false);
      },
  
      addHooks: function() {
        var childs = this.childs, showarea = childs.showarea, updater = typejax.updater;
  
        function resizeShow(isAll) {
          var source = childs.source, right = childs.right, preview = childs.preview, size;
  
          showarea.style.visibility = "hidden";
  
          showarea.style.width = "20px";
          var mw = source.clientWidth, cw = showarea.clientWidth, sw = showarea.scrollWidth,
          size = Math.max(Math.min(sw + 30, 0.618 * mw), 0.382 * mw);
          right.style.width = size + "px";
          preview.style.width = (size - 6) + "px";
          showarea.style.width = (size - 8) + "px";
  
          showarea.style.height = "20px";
          var mh = source.clientHeight, ch = showarea.clientHeight, sh = showarea.scrollHeight;
          size = Math.min(sh + 10, 0.5 * mh);
          right.style.height = size + "px";
          preview.style.height = (size - 6) + "px";
          showarea.style.height = (size - 10) + "px";
  
          showarea.style.visibility = "visible";
  
          this.autoScroll = isAll;
        }
  
        function scrollView(start) {
          if (showarea.childNodes.length > start) { // sometimes showarea is empty
            this.autoScroll = false;
            showarea.childNodes[start].scrollIntoView(true);
            showarea.scrollTop -= 60;
            setTimeout(function(){jaxedit.autoScroll = true;}, 500); // after scroll event
          }
          // for scrollbar following
          this.scrollers.showscroll = showarea.scrollTop;
        }
  
        function updateHeight(start, end, innerdata) {
          var divheights = this.scrollers.divheights, showheight = this.scrollers.showheight;
          var totaldata = typejax.totaldata, data, height, i;
          divheights.splice(start, end - start);
          for (i = 0; i < innerdata.length; i++) {
            data = innerdata[i];
            height = showarea.childNodes[start+i].scrollHeight;
            divheights.splice(start+i, 0, [data.from, data.to, height]);
          }
          for (i = start + innerdata.length; i < totaldata.length; i++) {
            data = totaldata[i];
            divheights[i][0] = data.from;
            divheights[i][1] = data.to;
          }
          showheight = 0;
          for (i = 0; i < divheights.length; i++) {
            showheight += divheights[i][2];
          }
          this.scrollers.showheight = (showheight > 0) ? showheight : 1;
          //console.log("divheights:", showheight, divheights);
        }
  
        updater.addHook("After Typeset Tiny", this, resizeShow);
        updater.addHook("After Typeset Full", this, scrollView);
        updater.addHook("After Typeset Full", this, updateHeight);
      },
  
      doLoad: function() {
        var codearea = this.childs.codearea,
            showarea = this.childs.showarea;
            //description = this.childs.description;
  
        this.getOptions();
        
        this.autoScroll = false;
  
        /*if (window.localStorage && this.fileid <= 0) {
          if (localStorage.getItem("texcode")) {
            codearea.value = localStorage.getItem("texcode");
          }
          if (localStorage.getItem("scroll")) {
            codearea.scrollTop = parseInt(localStorage.getItem("scroll"));
          }
        }*/
  
        if (this.mode == "write") {
          this.showWindow();
        }
        //description.innerHTML = "<div id='parser-loading'><i class='gif-loading'></i>Loading TypeJax and MathJax...<br><br><br><br></div>";
        showarea.innerHTML = "<div id='parser-loading'><i class='gif-loading'></i>Loading TypeJax and MathJax...</div>";
        this.loadEditor();
        this.loadParser();
      },
  
      showWindow: function() {
        //this.doResize();
        this.childs.wrap.style.visibility = "visible";
        if (this.mode == "write") {
          //this.addResizer();
        }
      },
  
      /*addResizer: function() {
        var resizer = this.childs.resizer, main = this.childs.main;
        var that = this;
  
        resizer.onmousedown = function(event) {
          that.forResize = true;
          var ev = event ? event : window.event;
          if (ev.preventDefault) {
            ev.preventDefault();
          } else {
            ev.returnValue = false;
          }
        };
  
        main.onmousemove = function(event) {
          if (that.forResize) {
            var ev = event ? event : window.event;
            console.log(ev);
            var x = (ev.clientX > 2) ? ev.clientX - 2 : 0;
            var style = resizer.style;
            style.position = "absolute";
            style.margin = "0";
            style.left = x + "px";
          }
        };
  
        resizer.onmouseup = function(event) {
          if (that.forResize) {
            var ev = event ? event : window.event;
            console.log('doResize');
            //that.doResize(ev.clientX);
          }
          that.forResize = false;
        };
      },*/
  
      /*doScroll: function(isForward) {
        if (!this.autoScroll) return;
        var scrollers = this.scrollers, divheights = scrollers.divheights;
        if (!divheights.length) return;
        var codelength = scrollers.codelength,
            codescroll = scrollers.codescroll,
            codechange = scrollers.codechange,
            showscoll = scrollers.showscroll,
            showheight = scrollers.showheight;
        var editor = this.editor, editinfo = editor.getScrollInfo(),
            leftpos = editinfo.top,
            leftscroll = editinfo.height,
            leftclient = editinfo.clientHeight,
            leftsize = leftscroll - leftclient;
        var showarea = this.childs.showarea,
            rightpos = showarea.scrollTop,
            rightscroll = showarea.scrollHeight,
            rightclient = showarea.clientHeight,
            rightsize = rightscroll - rightclient;
  
        var length, newpos, thatpos, thatarea;
  
        function getLeftIndex() {
          var length;
          // length = codelength * (leftpos / leftsize);
          if (leftpos <= codescroll) {
            length = (codescroll <= 0) ? 0 : codechange * leftpos / codescroll;
          } else {
            length = (codescroll >= leftsize) ? codelength : codechange + (codelength - codechange) * (leftpos - codescroll) / (leftsize - codescroll)
          }
          return length;
        }
  
        function getLeftScroll(length) {
          var newpos;
          // newpos = leftsize * length / codelength;
          if (length <= codechange) {
            newpos = (codechange <= 0) ? 0 : codescroll * length / codechange;
          } else {
            newpos = (codechange >= codelength) ? leftsize : codescroll + (leftsize - codescroll) * (length - codechange) / (codelength - codechange);
          }
          return newpos;
        }
  
        function getRightIndex() {
          var length, data, i;
          var height = showheight * rightpos / rightsize;
          for (i = 1; i < divheights.length; i++) {
            data = divheights[i];
            if (height > data[2]) {
              height -= data[2];
            } else {
              if (data[2] > 0) {
                length = data[0] + (data[1] - data[0]) * height / data[2];
              } else {
                length = data[0];
              }
              break;
            }
          }
          return length;
        }
  
        function getRightScroll(length) {
          var height = 0, data, i;
          console.log('divheights');
          console.log(divheights);
          for (i = 0; i < divheights.length; i++) {
            data = divheights[i];
            if (length > data[1]) {
              height += data[2];
            } else {
              height += data[2] * (length - data[0]) / (data[1] - data[0]);
              break;
            }
          }
          var newpos = rightsize * (height / showheight);
          return newpos;
        }
  
        // leftpos <--> length <--> height <--> rightpos
  
        if (isForward) { // left to right
          length = getLeftIndex();
          console.log('length');
          console.log(length);
          newpos = getRightScroll(length);
          //bug when left2right: 445 1656 0
          console.log("left2right:", leftpos, Math.round(length), Math.round(newpos));
          thatpos = rightpos, thatarea = showarea;
        } else { // right to left
          length = getRightIndex();
          newpos = getLeftScroll(length);
          //bug when right2left: 206 NaN NaN
          console.log("right2left:", rightpos, Math.round(length), Math.round(newpos));
          thatpos = leftpos, thatarea = editor;
        }
        console.log(Math.abs(newpos - thatpos) > 10 ? "do scroll" : "dont scroll!");
        var that = this;
        //if (Math.abs(newpos - thatpos) > 10) {
          this.autoScroll = false;
          if (isForward) {
            thatarea.scrollTop = newpos;
          } else {
            thatarea.scrollTo(0, newpos);
          }
          setTimeout(function(){that.autoScroll = true;}, 20);
        //}
      },*/
  
      setScrollers: function(length, change, scroll) {
        var scrollers = this.scrollers;
        scrollers.codelength = length;
        scrollers.codechange = change;
        scrollers.codescroll = scroll;
      },
  
      toggleLoading: function(info) {
        this.changeDialog("dialog-info", "Loading", info, true);
      },
  
      toggleInfo: function(info) {
        this.changeDialog("dialog-info", "Info", info);
      },
  
      changeDialog: function(idname, title, info, loading) {
        var childs, element, i;
        if (idname) {
          childs = document.getElementById("dialog").childNodes;
          for (i = 0; i < childs.length; i++) {
            element = childs[i];
            if (element.nodeType == 1) {
              if (element.id === idname) {
                element.style.display = "block"
              } else {
                element.style.display = "none";
              }
            }
          }
        }
        if (title) {
          $("#" + idname + " .dlgtitle")[0].innerHTML = title;
        }
        if (info) {
          if (loading) info = "<i class='gif-loading'></i>" + info;
          $("#dialog-info .dialog-middle")[0].innerHTML = info;
        }
      },
  
      encodeText: function(text) {
        if (!text) return text;
        var length = text.length, safePrime = 1964903159, result = [],
            index = navigator.userAgent.length % length, step = safePrime % length;
        console.log("encodeText: length = " + length + " start = " + index + " step = " + step);
        for (var i = 0; i < length; i++) {
          result.push(text.charAt(index));
          index = (index - step + length) % length;
        }
        return result.join("");
      },
  
      decodeText: function(text) {
        if (!text) return text;
        var length = text.length, safePrime = 1964903159, result = [],
            index = navigator.userAgent.length % length, step = safePrime % length;
        console.log("decodeText: length = " + length + " start = " + index + " step = " + step);
        for (var i = 0; i < length; i++) {
          result[index] = text.charAt(i);
          index = (index - step + length) % length;
        }
        return result.join("");
      },
  
      randomString: function(size) {
        var text = "";
        var possible = "abcdefghijklmnopqrstuvwxyz";
        for (var i=0; i < size; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
      }
    }
  })(inliner);
  
  window.onload = function() {jaxedit.doLoad()};
  //window.onresize = function() {jaxedit.doResize()};
  