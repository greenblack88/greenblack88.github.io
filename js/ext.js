! function(e, n, m, p) {
    XF.DBTechUserTaggingEditorHashTagger = XF.create({
        ed: null,
        visible: !1,
        idleWait: 200,
        idleTimer: null,
        pendingHashTag: "",
        results: null,
        __construct: function(b) {
            var a = this;
            this.ed = b;
            this.results = new XF.AutoCompleteResults({
                onInsert: function(b) {
                    a.insertHashTag(b)
                },
                clickAttacher: function(b, d) {
                    a.ed.events.bindClick(b, b, d)
                }
            });
            b.events.on("keydown", XF.proxy(this, "keydown"), !0);
            b.events.on("keyup", XF.proxy(this, "keyup"), !0);
            b.events.on("click blur", function() {
                a.hide()
            });
            b.$wp.on("scroll",
                function() {
                    a.hide()
                })
        },
        keydown: function(b) {
            if (this.visible) {
                var a = this.results,
                    c = function() {
                        b.preventDefault();
                        return !1
                    };
                switch (b.which) {
                    case 40:
                        return a.selectResult(1), c();
                    case 38:
                        return a.selectResult(-1), c();
                    case 27:
                        return this.hide(), c();
                    case 13:
                        return a.insertSelectedResult(), c()
                }
            }
        },
        keyup: function(b) {
            if (this.visible) switch (b.which) {
                case 40:
                case 38:
                case 13:
                    return
            }
            this.hide();
            this.idleTimer && clearTimeout(this.idleTimer);
            this.idleTimer = setTimeout(XF.proxy(this, "lookForHashTag"), this.idleWait)
        },
        lookForHashTag: function() {
            var b = this.getCurrentHashTagInfo();
            b ? this.foundHashTag(b.name) : this.hide()
        },
        getCurrentHashTagInfo: function() {
            var b = this.ed.selection.ranges(0);
            if (!b || !b.collapsed) return null;
            var a = b.endContainer;
            if (!a || 3 != a.nodeType) return null;
            var c = a.nodeValue.substring(0, b.endOffset),
                d = c.lastIndexOf("#");
            if (-1 == d) return null;
            if (0 == d || c.substr(d - 1, 1).match(/(\s|[\](,]|--)/))
                if (c = c.substr(d + 1), !c.match(/\s/) || 10 >= c.length) return {
                    textNode: a,
                    start: d,
                    name: c.replace(new RegExp(String.fromCharCode(160),
                        "g"), " "),
                    range: b
                };
            return null
        },
        foundHashTag: function(b) {
            this.pendingHashTag != b && (this.pendingHashTag = b, 2 <= b.length && "[" != b.substr(0, 1) && this.getPendingHashTagOptions())
        },
        getPendingHashTagOptions: function() {
            XF.ajax("GET", this.getAutoCompleteUrl(), {
                q: this.pendingHashTag
            }, XF.proxy(this, "handlePendingHashTagOptions"), {
                global: !1,
                error: !1
            })
        },
        handlePendingHashTagOptions: function(b) {
            var a = this.getCurrentHashTagInfo();
            b.q && a && b.q == a.name && (b.results ? this.show(b.q, b.results) : this.hide())
        },
        insertHashTag: function(b) {
            this.hide();
            XF.EditorHelpers.focus(this.ed);
            var a = this.getCurrentHashTagInfo();
            if (a) {
                var c = a.textNode,
                    d = c.nodeValue,
                    e = a.start + 1,
                    h = a.range;
                c.nodeValue = d.substr(0, e) + b + "\u00a0" + d.substr(e + a.name.length);
                h.setEnd(c, e + b.length + 1);
                h.collapse(!1);
                b = this.ed.selection.get();
                b.removeAllRanges();
                b.addRange(h)
            }
        },
        show: function(b, a) {
            var c = this.getCurrentHashTagInfo(),
                d = c.range,
                g = this.ed.$el;
            c && (this.visible = !0, this.results.showResults(b, a, g, function(a) {
                var b = g.dimensions();
                if (!d || !d.getBoundingClientRect) {
                    var f = d.startContainer;
                    return {
                        top: (3 == f.nodeType ? e(f.parentNode) : e(f)).dimensions().bottom + 3,
                        left: b.left + 5
                    }
                }
                f = d.cloneRange();
                f.setStart(c.textNode, c.start);
                f.setEnd(c.textNode, c.start + 1);
                f = f.getBoundingClientRect();
                a = a.width();
                var l = f.bottom + e(n).scrollTop() + 3;
                f = f.left;
                f + a > b.right && (f = d.getBoundingClientRect().left - a);
                f < b.left && (f = b.left);
                return {
                    top: l,
                    left: f
                }
            }))
        },
        hide: function() {
            this.visible && (this.visible = !1, this.results.hideResults())
        },
        getAutoCompleteUrl: function() {
            return "admin" == XF.getApp() ? XF.canonicalizeUrl("admin.php?dbtech-usertag/hashes/find") :
                XF.canonicalizeUrl("index.php?dbtech-usertag/hashes/find")
        }
    });
    XF.DBTechUserTagging = {
        init: function(b, a, c) {
            c.userTagger = new XF.DBTechUserTaggingEditorHashTagger(a);
            edx = e("textarea");
            edx.trigger("froalaEditor.initialized", edx[0]["data-froala.editor"]);
        },
        firstStart: function(b) {
            e.FE.PLUGINS.bbCode = function(a) {
                function b() {
                    return a.$tb.find(".fr-command[data-cmd=xfBbCode]")
                }

                function d() {
                    var b = a.$oel,
                        c = b.data("xfBbCodeBox");
                    if (!c) {
                        var d = parseInt(a.$wp.css("border-bottom-width"), 10) + parseInt(a.$wp.css("border-top-width"), 10);
                        c = e('<textarea class="input" style="display: none" />');
                        c.css({
                            minHeight: a.opts.heightMin ?
                                a.opts.heightMin + d + "px" : null,
                            maxHeight: a.opts.heightMax ? a.opts.heightMax + "px" : null,
                            height: a.opts.height ? a.opts.height + d + "px" : null,
                            padding: a.$el.css("padding")
                        });
                        c.attr("name", b.data("original-name"));
                        b.data("xfBbCodeBox", c);
                        a.$wp.after(c);
                        XF.Element.applyHandler(c, "textarea-handler");
                        XF.Element.applyHandler(c, "user-mentioner");
                        XF.Element.applyHandler(c, "dbtech-usertagging-hashtagger")
                    }
                    return c
                }

                function g(c, e) {
                    var f = d(),
                        l = function(c, d) {
                            k = !0;
                            var e;
                            (e = a.$oel.data("xfSmilieBox")) && e.hasClass("is-active") &&
                                XF.EditorHelpers.toggleSmilieBox(a, !1);
                            a.undo.saveStep();
                            a.$el.blur();
                            e = b();
                            a.$tb.find(" > .fr-command").not(e).addClass("fr-disabled");
                            e.addClass("fr-active");
                            a.$wp.css("display", "none");
                            a.$oel.prop("disabled", !0);
                            f.val(c).css("display", "").prop("disabled", !1).trigger("autosize");
                            d || f.autofocus();
                            XF.setIsEditorEnabled(!1)
                        };
                    "string" == typeof c ? l(c, e) : XF.ajax("POST", XF.canonicalizeUrl("index.php?editor/to-bb-code"), {
                        html: a.html.get()
                    }, function(a) {
                        l(a.bbCode, e)
                    })
                }

                function h(c) {
                    var f = d(),
                        h = function(c) {
                            k = !1;
                            var d = b();
                            a.$tb.find(" > .fr-command").not(d).removeClass("fr-disabled");
                            d.removeClass("fr-active");
                            a.$oel.prop("disabled", !1);
                            a.html.set(c);
                            f.css("display", "none").prop("disabled", !0);
                            a.$wp.css("display", "");
                            a.events.focus();
                            a.undo.saveStep();
                            XF.setIsEditorEnabled(!0);
                            XF.layoutChange()
                        };
                    if ("string" == typeof c) h(c);
                    else {
                        c = {
                            bb_code: f.val()
                        };
                        var g = a.$el.closest("form");
                        g.length && g[0][a.opts.xfBbCodeAttachmentContextInput] && (c.attachment_hash_combined = e(g[0][a.opts.xfBbCodeAttachmentContextInput]).val());
                        XF.ajax("POST", XF.canonicalizeUrl("index.php?editor/to-html"), c, function(a) {
                            h(a.editorHtml)
                        })
                    }
                }
                var k = !1;
                return {
                    _init: function() {
                        a.events.on("buttons.refresh", function() {
                            return !k
                        })
                    },
                    toBbCode: g,
                    isBbCodeView: function() {
                        return k
                    },
                    getTextArea: function() {
                        return k ? d() : null
                    },
                    insertBbCode: function(a) {
                        if (k) {
                            var b = d();
                            XF.insertIntoTextBox(b, a)
                        }
                    },
                    replaceBbCode: function(a) {
                        if (k) {
                            var b = d();
                            XF.replaceIntoTextBox(b, a)
                        }
                    },
                    toHtml: h,
                    toggle: function() {
                        k ? h() : g()
                    }
                }
            };
            e.FE.DefineIcon("xfBbCode", {
                NAME: "cog"
            });
            e.FE.RegisterCommand("xfBbCode", {
                title: "Toggle BB Code",
                icon: "xfBbCode",
                undo: !1,
                focus: !1,
                forcedRefresh: !0,
                callback: function() {
                    this.bbCode.toggle()
                }
            })
        },
        initBbCodeBox: function(b, a, c) {
            XF.Element.applyHandler(c, "dbtech-usertagging-hashtagger")
        }
    };
    e(m).on("editor:init", XF.DBTechUserTagging.init);
    e(m).on("editor:first-start", XF.DBTechUserTagging.firstStart)
}(jQuery, window, document);
