!function(f, h, u, v) {
    var b = navigator.userAgent;
    var t = /firefox/i.test(b);
    var o = /Edge/i.test(b);
    var a = !o && /Chrome/i.test(b);
    var p = /Mobi|Android/i.test(b);
    var B = f("#siropuChat");
    var x = f("#siropuChatHeader");
    var D = f("#siropuChatTabs");
    var d = D.find('a[data-target="room-list"]');
    var i = D.find('a[data-target="conv-list"]');
    var j = D.find('a[data-target="conv-form"]');
    var w = f("#siropuChatContent");
    var E = f(".siropuChatMessages");
    var r = f("#siropuChatStartConversation");
    var s = f(".siropuChatConversation.siropuChatUsers");
    var k = f("#siropuChatNoConversations");
    var F = f("#siropuChatRooms");
    var C = f("#siropuChatSettings");
    var e = f("#siropuChatEditor");
    var c = e.find("form");
    var n = c.find('textarea[name="message_html"]');
    var m = c.find('button[type="submit"]');
    var z = f("#siropuChatBar");
    var y = f("#siropuChatBarMessageContainer");
    var q = f("#siropuChatBarUserCount span");
    var l = B.hasClass("siropuChatAllPages");
    var A = f(".siropuChatLogout");
    var g = f('a[data-nav-id="siropuChat"]');
    XF.SiropuChat = {};
    XF.SiropuChat.Core = XF.Element.newHandler({
        options: {
            active: false
        },
        userId: 0,
        canUseChat: true,
        loggedIn: f("#XF").data("logged-in"),
        channel: "room",
        screenSize: "l",
        serverTime: 0,
        pageFocus: true,
        pageTitle: f("title").text(),
        tabNotification: false,
        tabNotificationInterval: null,
        roomId: 1,
        primaryRoomId: 0,
        lastId: {},
        convId: 0,
        convUnread: {},
        convOnly: 0,
        convItems: [],
        guestRoom: 0,
        noticeLastUpdate: 0,
        userLastUpdate: 0,
        convLastActive: 0,
        convLastUpdate: 0,
        userUpdateInterval: 30,
        convUpdateInterval: 60,
        messageDisplayLimit: 25,
        notificationTimeout: 5000,
        isVisible: B.is(":visible"),
        refreshActive: 5000,
        refreshActiveHidden: 15000,
        refreshInactive: 30000,
        refreshInactiveHidden: 60000,
        refreshInterval: 0,
        refreshSet: null,
        inverse: 0,
        floadCheck: 0,
        roomFloodCheck: 0,
        bypassFloodCheck: false,
        displayNavCount: false,
        forceRoom: false,
        inIframe: h.frameElement,
        dynamicTitle: true,
        activeUsers: {},
        commands: {},
        sounds: {},
        loadMoreButton: {
            room: true,
            conv: true
        },
        forceAutoScroll: false,
        joinCommand: null,
        loadRooms: false,
        internalLinksInNewTab: false,
        roomTabUserCount: true,
        enableRightNavLinkMobile: true,
        convTabCount: "onlineCount",
        userListOrder: "most_active",
        init: function() {
            this.getScreenSize();
            this.startRefreshInterval();
            this._initSubmitForm();
            this._initTabs();
            this._initRoomListActions();
            this._initRoomActions();
            this._initConversations();
            this._initAutoScrollToggle();
            this._initSounds();
            this._initOnLoad();
            C.on("change", f.proxy(this, "saveSettings"));
            z.on("click", f.proxy(this, "toggleChat"));
            B.on("new-message", f.proxy(this, "newMessage"));
            var H = this;
            if (l) {
                f(".p-footer").css("padding-bottom", 60)
            }
            if (p && this.enableRightNavLinkMobile) {
                if (f(".p-nav-menuTrigger").is(":visible") && g.length && !f(".p-navgroup-link--chat").length) {
                    var I = parseInt(g.find(".badge").text());
                    var G = f('<a href="' + g.attr("href") + '" class="p-navgroup-link p-navgroup-link--chat" aria-label="Chat" title="Chat"><i class="far fa-comments"></i></a>');
                    if (I) {
                        G.addClass("badgeContainer badgeContainer--highlighted").attr("data-badge", I)
                    }
                    G.insertAfter(".p-navgroup-link--whatsnew")
                }
            }
            f(h).scroll(function() {
                if (f(".p-navSticky").length && f(".siropuChatAllPages.siropuChatMaximized").length) {
                    H.adjustContentHeight()
                }
            });
            f(h).resize(function() {
                if (p) {
                    return
                }
                H.getScreenSize();
                H.adjustContentHeight();
                H.adjustInputBox();
                if (H.inRoom()) {
                    if (D.length) {
                        H.switchRoom(H.roomId, true)
                    } else {
                        if (!H.getMiscSetting("hide_chatters")) {
                            var J = f('.siropuChatRoom.siropuChatUsers[data-room-id="' + H.roomId + '"]');
                            if (H.screenSizeIs("s")) {
                                J.hide()
                            } else {
                                J.show()
                            }
                        }
                    }
                } else {
                    H.switchConversation(H.convId)
                }
            });
            f(h).blur(function() {
                H.pageFocus = false
            });
            f(h).focus(function() {
                H.pageFocus = true;
                if (H.tabNotificationInterval) {
                    clearInterval(H.tabNotificationInterval);
                    f("title").text(H.pageTitle)
                }
            });
            f(u).on("keyup", function(J) {
                if (J.which == 27 && l && H.isVisible) {
                    H.toggleChat()
                }
            });
            f(u).on("click", ".siropuChatMessageRow.siropuChatBot ol li b", function() {
                H.editorSetHtml(f(this).html())
            });
            f(u).on("siropuChat:show-load-more", ".siropuChatMessages", function() {
                if (H.inRoom() && !H.loadMoreButton.room || H.inConv() && !H.loadMoreButton.conv) {
                    return
                }
                if (f(this).find("> li[data-id]").length < H.messageDisplayLimit) {
                    return
                }
                var K = f('<li class="siropuChatLoadMoreMessages" style="display: none;" />');
                var J = f('<a class="button button--link" data-xf-click="siropu-chat-load-more-messages" />');
                J.html(XF.phrase("siropu_chat_load_more_messages")).appendTo(K);
                if (f(this).find(".siropuChatLoadMoreMessages").length) {
                    return f(this).find(".siropuChatLoadMoreMessages").fadeIn()
                }
                if (H.inverse) {
                    K.appendTo(f(this)).fadeIn();
                    f(this).scrollTop(1000000)
                } else {
                    K.prependTo(f(this)).fadeIn()
                }
                XF.activate(K)
            });
            f(u).on("click", function(J) {
                if (l && H.isVisible && J.target.className.match("p-")) {
                    z.trigger("click")
                }
            });
            this.$target.on("mouseover mouseout", ".siropuChatMessageRow", function(K) {
                var L = f(this).find(".siropuChatMessageActions");
                var J = f(this).find(".siropuChatDateTime");
                if (L.length) {
                    if (K.type == "mouseover") {
                        L.show();
                        J.hide()
                    } else {
                        L.hide();
                        J.show()
                    }
                }
            });
            f(u).on("click", ".siropuChatMessageText .link--internal", function(J) {
                if (H.internalLinksInNewTab) {
                    J.preventDefault();
                    h.open(f(this).attr("href"), "_blank")
                }
            });
            f("#siropuChatBarDisable").on("click", function() {
                f(this).find("i").removeClass("fa-toggle-off").addClass("fa-toggle-on");
                setTimeout(function() {
                    C.find('input[name="disable"]').trigger("click")
                }, 1000)
            });
            setTimeout(function() {
                if (H.inRoom() && H.loadRooms && !H.getRoomCount()) {
                    d.click()
                } else {
                    if (H.inConv() && H.getConvCount()) {
                        s.find(".siropuChatActiveConversation").trigger("click", true)
                    }
                }
                if (H.hasUnreadConversations()) {
                    H.addBarNewMessageClass()
                }
            }, 500);
            if (this.inRoom() && this.isResponsive()) {
                f(".siropuChatRoom.siropuChatUsers").hide()
            }
            if (this.inConv()) {
                this.orderConversations()
            }
            this.joinCommand = this.getCommand("join");
            this.noticeLastUpdate = this.serverTime;
            this.userLastUpdate = this.serverTime;
            this.convLastUpdate = this.serverTime;
            this.convLastActive = this.serverTime;
            this.autoScroll();
            this.toggleLogout();
            this.toggleBotMessages()
        },
        getScreenSize: function() {
            if (h.matchMedia("(max-width: 768px)").matches) {
                this.screenSize = "s"
            } else {
                if (h.matchMedia("(max-width: 1024px)").matches) {
                    this.screenSize = "m"
                } else {
                    this.screenSize = "l"
                }
            }
        },
        getRoomCount: function() {
            return B.find(".siropuChatMessages[data-room-id]").length
        },
        getConvCount: function() {
            return B.find("li[data-conv-id]").length
        },
        screenSizeIs: function(G) {
            return this.screenSize == G
        },
        isResponsive: function() {
            return (this.screenSizeIs("s") || B.hasClass("siropuChatSidebar"))
        },
        newMessage: function(H, G) {
            if (!this.pageFocus && G.isSelf) {
                return
            }
            if (G.action != "join") {
                this.playSound(G);
                if (!this.pageFocus) {
                    this.displayTabNotification(G);
                    this.initDesktopNotification(G)
                }
            }
        },
        doMessageActions: function(M) {
            if (!M.actions) {
                return
            }
            for (var H in M.actions) {
                var K = M.actions[H];
                for (var R in K) {
                    if (H == "rooms" && this.lastId[R] === undefined) {
                        continue
                    }
                    if (H == "rooms") {
                        var G = f('.siropuChatMessages[data-room-id="' + R + '"]')
                    } else {
                        var G = f('.siropuChatMessages[data-conv-id="' + R + '"]')
                    }
                    for (var P in K[R]) {
                        var J = K[R][P];
                        var S = G.find('> li[data-id="' + P + '"]');
                        for (var Q in J.action) {
                            if (S.attr("data-last-change") == J.action[Q]) {
                                continue
                            }
                            switch (Q) {
                            case "edit":
                                S.find(".siropuChatMessageText").html(J.html);
                                break;
                            case "delete":
                                S.fadeOut();
                                break;
                            case "like":
                                var I = S.find(".siropuChatMessageLikes");
                                if (I.length) {
                                    if (J.likes) {
                                        I.replaceWith(J.likes)
                                    } else {
                                        I.remove()
                                    }
                                } else {
                                    S.find(".siropuChatMessageText").after(J.likes)
                                }
                                break;
                            case "react":
                                var O = S.find(".siropuChatReactions");
                                var N = f(J.reactions);
                                if (N) {
                                    N.find(".siropuChatReactionView").replaceWith(XF.phrase("view"))
                                }
                                if (O.length) {
                                    if (N) {
                                        O.html(N)
                                    } else {
                                        O.remove()
                                    }
                                } else {
                                    S.find(".siropuChatMessageText").after(N)
                                }
                                break;
                            case "prune":
                                if (J.prune) {
                                    if (f.isNumeric(J.prune)) {
                                        G.find('> li[data-user-id="' + J.prune + '"]').remove()
                                    } else {
                                        for (var L in J.prune) {
                                            G.find('> li[data-id="' + J.prune[L] + '"]').remove()
                                        }
                                    }
                                } else {
                                    G.find("> li").each(function() {
                                        if (f(this).data("id") < P) {
                                            f(this).remove()
                                        }
                                    })
                                }
                                break
                            }
                            S.attr("data-last-change", J.action[Q])
                        }
                    }
                }
            }
        },
        updateHeaderTitle: function(G) {
            if (this.dynamicTitle) {
                x.find("> span").text(G.data("title"))
            }
        },
        updateRooms: function(Z) {
            var R = this;
            var X = false;
            var Y = false;
            if (Z.rooms === undefined) {
                return
            }
            for (var G in Z.rooms) {
                var M = w.find('.siropuChatRoom.siropuChatMessages[data-room-id="' + G + '"]');
                var J = w.find('.siropuChatRoom.siropuChatUsers[data-room-id="' + G + '"]');
                var V = f(Z.rooms[G]["messages"]);
                var Q = Z.rooms[G]["users"];
                var K = Z.rooms[G]["userCount"];
                var W = D.find('a[data-room-id="' + G + '"]');
                var U = J.find(".siropuChatNoRoomUsers");
                if (this.activeUsers[G] === undefined) {
                    this.activeUsers[G] = []
                }
                var T = false;
                if (Z.inactiveRoomId !== undefined || Z.action != "submit" && (Z.action == "join" || Z.updateUsers)) {
                    if (K) {
                        for (var I in Q) {
                            var N = Q[I];
                            var H = N.activity;
                            var S = N.status;
                            var O = N.html;
                            if (I) {
                                var aa = J.find('> li[data-user-id="' + I + '"]')
                            } else {
                                var aa = J.find('li[data-username="' + N.username + '"]')
                            }
                            if (O) {
                                if (aa.length) {
                                    if (I == 0) {
                                        aa.find(".siropuChatActivityStatus").attr("data-status", H)
                                    }
                                    continue
                                }
                                if (U.length) {
                                    J.html(O)
                                } else {
                                    J.prepend(O)
                                }
                                if (I && f.inArray(I, this.activeUsers[G]) == -1) {
                                    this.activeUsers[G].push(I);
                                    T = true
                                }
                                XF.activate(J)
                            } else {
                                if (aa.length) {
                                    if (H == "inactive") {
                                        aa.remove();
                                        this.removeUserFromActiveUsers(G, I)
                                    } else {
                                        this.updateUser(aa, H, S)
                                    }
                                }
                            }
                        }
                        if (this.userListOrder == "most_active") {
                            T = true
                        }
                    } else {
                        this.activeUsers[G] = [];
                        this.addNoRoomUsersMessage(J)
                    }
                    if (this.roomTabUserCount) {
                        W.find("span").html(K).addClass("siropuChatTabCount" + (K ? "Active" : "Inactive"))
                    }
                    Y = true
                }
                if (V.length) {
                    V = f.grep(V, function(ab) {
                        return M.find('> li[data-id="' + f(ab).data("id") + '"]').length ? false : true
                    });
                    if (this.inverse) {
                        M.prepend(V)
                    } else {
                        M.append(V)
                    }
                    XF.activate(M);
                    this.delayAutoscroll(Z, M);
                    this.deleteOlderMessages(Z.serverTime, M);
                    if (!W.hasClass("siropuChatActiveTab")) {
                        W.addClass("siropuChatNewMessage")
                    }
                    if (f(V).length) {
                        X = true
                    }
                }
                if (T) {
                    var P = J.find("> li").detach();
                    switch (this.userListOrder) {
                    case "most_active":
                        var L = P.sort(function(ac, ab) {
                            return f(ac).data("last-active") - f(ab).data("last-active")
                        });
                        break;
                    case "alphabetically":
                        var L = P.sort(function(ac, ab) {
                            return String.prototype.localeCompare.call(f(ac).data("username").toLowerCase(), f(ab).data("username").toLowerCase())
                        });
                        break
                    }
                    J.html(L)
                }
            }
            if (Y) {
                this.userLastUpdate = Z.serverTime;
                this.updateNavUserCount(Z)
            }
            this.updateLastId(Z);
            this.updateRoomTabs(Z);
            this.updateBar(Z, Y);
            if (X) {
                Z.channel = "room";
                B.trigger("new-message", Z)
            }
        },
        updateConversations: function(L) {
            var Q = this;
            var N = false;
            this.convUnread = {};
            if (L.convContacts && (L.action == "start" || L.updateConv)) {
                if (this.convTabCount != "disabled") {
                    i.find("span").html(L.convTabCount).attr("class", L.convTabCount ? "siropuChatTabCountActive" : "siropuChatTabCountInactive")
                }
                if (L.convItems !== undefined) {
                    this.convItems = L.convItems
                }
                for (var P in L.convContacts) {
                    var I = L.convContacts[P]["activity"];
                    var J = L.convContacts[P]["status"];
                    var M = L.convContacts[P]["html"];
                    if (M) {
                        s.prepend(M);
                        if (k.length) {
                            k.remove()
                        }
                        if (f.inArray(P, this.convItems) == -1) {
                            this.convItems.push(P)
                        }
                    } else {
                        var O = s.find('> li[data-conv-id="' + P + '"]');
                        if (O.length) {
                            this.updateUser(O, I, J)
                        }
                    }
                }
                this.convLastUpdate = L.serverTime
            }
            if (L.convMessages) {
                for (var H in L.convMessages) {
                    var K = f(L.convMessages[H]);
                    var G = f('.siropuChatConversation.siropuChatMessages[data-conv-id="' + H + '"]');
                    if (G.length) {
                        K = f.grep(K, function(R) {
                            return G.find('> li[data-id="' + f(R).data("id") + '"]').length ? false : true
                        })
                    } else {
                        if (!this.convId || L.convId) {
                            G = this.createConversationMessageContainer(H);
                            G.insertBefore(r);
                            this.convId = L.convId ? L.convId : H;
                            setTimeout(function() {
                                s.find('li[data-conv-id="' + Q.convId + '"]').click()
                            })
                        }
                    }
                    if (this.inverse) {
                        G.prepend(K)
                    } else {
                        G.append(K)
                    }
                    XF.activate(G);
                    this.delayAutoscroll(L, G);
                    this.deleteOlderMessages(L.serverTime, G)
                }
            }
            if (L.convUnread) {
                this.convUnread = L.convUnread;
                for (var H in L.convUnread) {
                    var O = s.find('li[data-conv-id="' + H + '"]');
                    if (!O.hasClass("siropuChatNewMessage")) {
                        N = true
                    }
                    O.addClass("siropuChatNewMessage")
                }
                if (this.inRoom()) {
                    i.addClass("siropuChatNewMessage")
                }
            }
            if (N) {
                L.channel = "conv";
                B.trigger("new-message", L);
                this.addBarNewMessageClass();
                this.orderConversations()
            }
        },
        orderConversations: function() {
            if (s.find("li.siropuChatNewMessage").length) {
                var H = s.find("> li").detach();
                var G = H.sort(function(J, I) {
                    return Number(f(I).hasClass("siropuChatNewMessage")) > Number(f(J).hasClass("siropuChatNewMessage")) ? 1 : -1
                });
                s.html(G)
            }
        },
        hasUnreadConversations: function() {
            return !f.isEmptyObject(this.convUnread)
        },
        markCurrentConversationAsRead: function() {
            if (this.convUnread[this.convId] !== undefined) {
                var G = this;
                XF.ajax("POST", XF.canonicalizeUrl("index.php?chat/conversation/" + this.convId + "/mark-as-read"), {
                    conv_unread: this.convUnread[this.convId]
                }, function(H) {
                    if (H.convRead) {
                        delete G.convUnread[H.convRead]
                    }
                }, {
                    skipDefault: true,
                    global: false
                })
            }
        },
        createRoomMessageContainer: function(G) {
            return f('<ul class="siropuChatRoom siropuChatMessages" data-room-id="' + G + '" data-autoscroll="1" />')
        },
        createConversationMessageContainer: function(G) {
            return f('<ul class="siropuChatConversation siropuChatMessages" data-conv-id="' + G + '" data-autoscroll="1" />')
        },
        updateNotice: function(H) {
            var I = f("#siropuChatNotice");
            if (H.notice && (H.serverTime - this.noticeLastUpdate >= 60 || !I.length)) {
                var G = f(H.notice);
                if (I.length && I.find("span").text() == G.find("span").text()) {
                    return
                }
                G.find("span").hide();
                if (I.length) {
                    I.replaceWith(G)
                } else {
                    x.after(G)
                }
                setTimeout(function() {
                    G.find("span").fadeIn()
                });
                this.noticeLastUpdate = H.serverTime
            }
            if (!H.notice && I.length) {
                I.remove()
            }
        },
        updateUser: function(H, L, G) {
            H.find(".siropuChatActivityStatus").attr("data-status", L);
            var K = H.find(".siropuChatUserStatus");
            var J = K.length;
            if (G) {
                if (J) {
                    K.html(G)
                } else {
                    var I = f('<div class="siropuChatUserStatus" />');
                    I.html(G).appendTo(H)
                }
            } else {
                if (J) {
                    K.remove()
                }
            }
        },
        updateActivityStatus: function(G) {
            if (G.action != "submit" && this.options.active != G.active) {
                this.options.active = G.active;
                B.attr("data-active", G.active);
                this.resetRefreshInterval()
            }
        },
        updateNavUserCount: function(I) {
            if (!this.displayNavCount) {
                return
            }
            var G = g.find("span.badge");
            G.text(I.userCount);
            if (I.userCount) {
                G.addClass("badge--active")
            } else {
                G.removeClass("badge--active")
            }
            var H = f(".p-navgroup-link--chat");
            if (H.length) {
                if (I.userCount) {
                    H.addClass("badgeContainer badgeContainer--highlighted")
                } else {
                    H.removeClass("badgeContainer badgeContainer--highlighted")
                }
                H.attr("data-badge", I.userCount)
            }
        },
        updateBar: function(G, H) {
            if (!(G.lastRow && l)) {
                return
            }
            y.html(G.lastRow.message);
            z.attr("data-room-id", G.lastRow.roomId);
            if (G.action != "submit" && !this.getMiscSetting("hide_chatters") && H) {
                q.html(G.userCount)
            }
        },
        updateRoomTabs: function(H) {
            if (this.forceRoom == true || this.loggedIn == false || H.joinedRooms === undefined) {
                return
            }
            if (D.length) {
                if (this.lastId && H.joinedRooms) {
                    for (var G in this.lastId) {
                        if (f.inArray(Number(G), H.joinedRooms) == -1) {
                            this.leaveRoomPostActions(G)
                        }
                    }
                } else {
                    if (this.getRoomCount()) {
                        this.postLogout()
                    }
                }
            }
        },
        updateLastId: function(G) {
            if (G.lastId === undefined || G.lastId.length === 0) {
                return
            }
            for (var H in G.lastId) {
                this.lastId[H] = G.lastId[H]
            }
        },
        getRooms: function() {
            XF.ajax("GET", XF.canonicalizeUrl("index.php?chat/room/list"), {}, function(G) {
                if (G.html) {
                    XF.setupHtmlInsert(G.html, function(H, I, J) {
                        F.html(H)
                    })
                }
            })
        },
        loadRoom: function(I) {
            var G = this;
            var H = f(I.roomTab);
            if (this.getRoomCount() == 0) {
                H.removeClass("siropuChatActiveTab")
            }
            H.insertBefore(d);
            var J = this.createRoomMessageContainer(I.roomId);
            J.prependTo(w);
            this._initAutoScrollToggle(J);
            f('<ul class="siropuChatRoom siropuChatUsers" data-room-id="' + I.roomId + '" />').prependTo(w);
            this.activeUsers[I.roomId] = I.userIds;
            this.updateRooms(I);
            setTimeout(function() {
                G.doAutoScroll(J)
            });
            this.switchRoom(I.roomId);
            this.toggleLogout()
        },
        leaveRoom: function(H) {
            var G = this;
            var H = H ? H : this.roomId;
            XF.ajax("POST", XF.canonicalizeUrl("index.php?chat/room/" + H + "/leave"), {}, function(I) {
                G.leaveRoomPostActions(H)
            }, {
                skipDefault: true
            })
        },
        leaveRoomPostActions: function(I, G) {
            var K = B.find('[data-room-id="' + I + '"]');
            var H = D.find('[data-room-id="' + I + '"]');
            if (H.data("leave") == false) {
                return false
            }
            K.remove();
            delete this.lastId[I];
            delete this.activeUsers[I];
            XF.Cookie.remove("siropu_chat_room_id");
            if (G) {
                var J = D.find("[data-room-id]:last");
                if (J.length) {
                    J.click()
                } else {
                    d.click()
                }
            }
            this.toggleLogout()
        },
        leaveConversationPostActions: function(G) {
            B.find('[data-conv-id="' + G.convId + '"]').remove();
            this.convItems.splice(f.inArray(G.convId, this.convItems), 1);
            XF.Cookie.remove("siropu_chat_conv_id");
            if (this.getConvCount()) {
                s.find("li[data-conv-id]:first").click()
            } else {
                if (G.noConversations !== undefined) {
                    s.html(G.noConversations);
                    XF.activate(s)
                }
            }
        },
        autoScroll: function(G) {
            var G = G ? G : f(".siropuChatMessages");
            if (G.attr("data-autoscroll") == 1 || this.forceAutoScroll) {
                this.doAutoScroll(G)
            }
        },
        doAutoScroll: function(G) {
            var G = G ? G : f(".siropuChatMessages");
            if (this.inverse) {
                G.scrollTop(0)
            } else {
                G.scrollTop(1000000)
            }
        },
        delayAutoscroll: function(I, H) {
            var G = this;
            if (I.hasImages) {
                setTimeout(function() {
                    G.autoScroll(H)
                }, 1000)
            } else {
                this.autoScroll(H)
            }
        },
        getSoundSetting: function(G) {
            return C.find('input[name="sound[' + G + ']"]').is(":checked")
        },
        getNotificationSetting: function(G) {
            return C.find('input[name="notification[' + G + ']"]').is(":checked")
        },
        getMiscSetting: function(G) {
            return C.find('input[name="' + G + '"]').is(":checked")
        },
        getCommand: function(G) {
            return this.commands[G]
        },
        getNotificationPhrase: function(H) {
            var G = this.getMessageType(H);
            switch (G) {
            case "mention":
            case "public":
                return XF.phrase("siropu_chat_new_public_message");
                break;
            case "private":
                return XF.phrase("siropu_chat_new_private_message");
                break;
            case "whisper":
                return XF.phrase("siropu_chat_new_whisper_message");
                break;
            default:
                return XF.phrase("siropu_chat_new_message");
                break
            }
        },
        getMessageType: function(G) {
            return G.channel == "room" ? G.lastRow.type : G.convLastRow.type
        },
        playSound: function(G) {
            if (XF.isIOS()) {
                return false
            }
            if (G.channel == "room") {
                var H = G.playSound
            } else {
                var H = G.convPlaySound
            }
            if (this.sounds[H]) {
                this.sounds[H].play()
            }
        },
        initDesktopNotification: function(H) {
            var G = this;
            if (!("Notification"in h)) {
                return
            }
            if (!this.getNotificationSetting(this.getMessageType(H))) {
                return
            }
            if (Notification.permission === "granted") {
                this.sendDesktopNotification(H)
            } else {
                if (Notification.permission !== "denied") {
                    Notification.requestPermission(function(I) {
                        if (I === "granted") {
                            G.sendDesktopNotification(H)
                        }
                    })
                }
            }
        },
        sendDesktopNotification: function(J) {
            if (J.channel == "room") {
                var I = J.lastRow
            } else {
                var I = J.convLastRow
            }
            var G = this;
            var H = {
                body: I.text,
                icon: I.avatar,
                tag: "siropuChatNotification"
            };
            var K = new Notification(this.getNotificationPhrase(J),H);
            setTimeout(K.close.bind(K), this.notificationTimeout);
            K.onclick = function() {
                this.close();
                h.focus();
                if (l && G.isVisible) {
                    z.click()
                } else {
                    G.switchRoom()
                }
            }
        },
        displayTabNotification: function(H) {
            var G = this;
            if (this.tabNotification && !this.tabNotificationInterval) {
                this.tabNotificationInterval = setInterval(function() {
                    f("title").text(f("title").text() == G.pageTitle ? G.getNotificationPhrase(H) : G.pageTitle)
                }, 1500)
            }
        },
        switchRoom: function(J, H) {
            var I = D.find('a[data-room-id="' + J + '"]');
            var G = I.data("flood-check");
            this.roomFloodCheck = G ? G : this.floodCheck;
            I.trigger("click", H)
        },
        switchConversation: function(G) {
            s.find('li[data-conv-id="' + G + '"]').click()
        },
        preSubmit: function() {
            var G = this;
            if (XF.isEditorEnabled()) {
                this.editorSetHtml("");
                this.editorOffPlaceholder("posting")
            } else {
                c.find('textarea[name="message"]').val("")
            }
            this.responseTimeout = setTimeout(function() {
                G.editorSetPlaceholder("noresponse");
                G.editorOn();
                G.startRefreshInterval()
            }, 5000);
            this.stopRefreshInterval()
        },
        postSubmit: function() {
            if (this.inRoom() && !this.getRoomCount() || this.inConv() && !this.getConvCount()) {
                this.editorOffPlaceholder("")
            } else {
                this.editorOn();
                this.editorFocus();
                if (this.inRoom()) {
                    this.editorSetPlaceholder("public")
                } else {
                    this.editorSetPlaceholder("private", s.find('li[data-conv-id="' + this.convId + '"]'))
                }
            }
            clearTimeout(this.responseTimeout);
            this.startRefreshInterval()
        },
        saveSettings: function(H) {
            var G = this;
            if (!C.length) {
                return
            }
            XF.ajax("POST", XF.canonicalizeUrl("index.php?chat/save-settings"), C.serialize(), function(J) {
                if (J.errorHtml) {
                    XF.setupHtmlInsert(J.errorHtml, function(K, L) {
                        var M = L.h1 || L.title || XF.phrase("oops_we_ran_into_some_problems");
                        XF.overlayMessage(M, K)
                    });
                    return true
                }
                var I = "";
                if (H !== undefined) {
                    I = H.target.name
                }
                switch (I) {
                case "inverse":
                    G.inverse = G.getMiscSetting("inverse");
                    G.autoScroll();
                    break;
                case "maximized":
                    B.toggleClass("siropuChatMaximized");
                    G.adjustContentHeight();
                    if (l && !B.hasClass("siropuChatMaximized")) {
                        B.css("z-index", "");
                        w.css("height", "")
                    }
                    break;
                case "display_mode":
                case "editor_on_top":
                    if (I == "display_mode" && B.hasClass("siropuChatPage")) {
                        return
                    }
                    XF.flashMessage(XF.phrase("siropu_chat_settings_change_reload_page"), 3000);
                    break;
                case "hide_bot":
                    G.toggleBotMessages();
                    break;
                case "hide_chatters":
                    B.toggleClass("siropuChatHideUserList");
                    break;
                case "disable":
                    f("#siropuChatBar").remove();
                    C.parents(".menu").remove();
                    XF.flashMessage(XF.phrase("siropu_chat_has_been_disabled"), 5000);
                    XF.setupHtmlInsert(J.html, function(K, L) {
                        B.replaceWith(K)
                    });
                    break;
                default:
                    if (I.match("sound")) {
                        G._initSounds()
                    }
                    break
                }
            }, {
                skipDefault: true
            })
        },
        toggleChat: function(H) {
            if (H.target.className.match("fa-")) {
                return
            }
            B.toggle();
            y.toggle();
            this.isVisible = B.is(":visible");
            if (this.inRoom()) {
                this.switchRoom(z.attr("data-room-id"))
            }
            if (this.inConv() && this.isVisible && this.hasUnreadConversations()) {
                this.markCurrentConversationAsRead()
            }
            z.removeClass("siropuChatNewMessage");
            this.doAutoScroll();
            this.resetRefreshInterval();
            if (!this.screenSizeIs("s")) {
                this.editorFocus()
            }
            var G = B.height() + z.height() + 10;
            if (G > f(h).height()) {
                this.adjustContentHeight()
            }
        },
        toggleAutoScroll: function(G) {
            var I = parseInt(G[0].scrollHeight - G.innerHeight());
            var H = parseInt(G.scrollTop());
            G.attr("data-autoscroll", 0);
            if (((H == I || H + 1 == I || H - 1 == I) && !this.inverse) || H == 0 && this.inverse) {
                G.attr("data-autoscroll", 1)
            }
            if (H == 0 && !this.inverse || ((H == I || H + 1 == I || H - 1 == I) && this.inverse)) {
                G.trigger("siropuChat:show-load-more")
            }
        },
        toggleLogout: function() {
            if (!A.length) {
                return
            }
            var G = this.getRoomCount();
            var H = B.find('a[data-leave="false"]').length;
            if (G == 0 || (G - H) == 0) {
                A.fadeOut()
            } else {
                A.fadeIn()
            }
        },
        toggleBotMessages: function() {
            var G = f(".siropuChatRoom.siropuChatMessages > li.siropuChatBot");
            if (this.getMiscSetting("hide_bot")) {
                G.fadeOut()
            } else {
                G.fadeIn()
            }
        },
        startRefreshInterval: function() {
            if (this.isVisible) {
                if (this.options.active) {
                    this.refreshInterval = this.refreshActive
                } else {
                    this.refreshInterval = this.refreshInactive
                }
            } else {
                if (this.options.active) {
                    this.refreshInterval = this.refreshActiveHidden
                } else {
                    this.refreshInterval = this.refreshInactiveHidden
                }
            }
            this.refreshSet = setInterval(f.proxy(this, "refresh"), this.refreshInterval)
        },
        resetRefreshInterval: function() {
            this.stopRefreshInterval();
            var G = this;
            setTimeout(function() {
                G.startRefreshInterval()
            })
        },
        stopRefreshInterval: function() {
            clearInterval(this.refreshSet)
        },
        refresh: function() {
            var G = this;
            XF.ajax("GET", XF.canonicalizeUrl("index.php?chat/update"), {
                users: this.getUserList(),
                channel: this.channel,
                room_id: this.roomId,
                last_id: this.lastId,
                conv_id: this.convId,
                conv_unread: this.isVisible ? this.convUnread : {},
                conv_only: this.convOnly,
                conv_items: this.getConvItems(),
                conv_last_active: this.convLastActive,
                conv_last_update: this.convLastUpdate,
                user_last_update: this.userLastUpdate,
                is_chat_page: B.hasClass("siropuChatPage") ? 1 : 0
            }, function(H) {
                G.updateRooms(H);
                G.updateConversations(H);
                G.updateNotice(H);
                G.updateActivityStatus(H);
                setTimeout(function() {
                    G.doMessageActions(H)
                })
            }, {
                skipDefault: true,
                skipError: true,
                global: false
            })
        },
        getUserList: function() {
            var G = {};
            for (var H in this.activeUsers) {
                G[H] = this.activeUsers[H].join(",")
            }
            return G
        },
        getConvItems: function() {
            return this.convItems.join(",")
        },
        adjustContentHeight: function() {
            var L = f(h).height();
            var G = B.height();
            var I = w.height();
            var K = z.height();
            var H = L - G;
            var J = 0;
            if (f(".p-navSticky").length && f(".p-navSticky.is-sticky").length) {
                J = f(".p-navSticky").height()
            }
            if (f(".siropuChatAllPages.siropuChatMaximized").length) {
                B.css("z-index", 100);
                w.css("height", (I + H - K - J - 20) + "px")
            } else {
                if (f("#siropuChatFullPage").length) {
                    w.css("height", (I + H) + "px")
                } else {
                    if (this.screenSizeIs("s")) {
                        w.css("height", (I + H - K - 20) + "px")
                    }
                }
            }
            this.doAutoScroll()
        },
        adjustInputBox: function() {
            if (m.length && f('html[dir="LTR"]').length) {
                e.find(".fr-view").css("padding-right", m.outerWidth() + 10)
            }
        },
        getFloodCheck: function() {
            if (this.bypassFloodCheck) {
                return 0
            }
            if (this.inRoom()) {
                return this.roomFloodCheck
            } else {
                return this.floodCheck
            }
        },
        editorFocus: function() {
            n.froalaEditor.events.focus()
        },
        editorOn: function() {
            n.froalaEditor.edit.on()
        },
        editorOff: function() {
            n.froalaEditor.edit.off()
        },
        editorInsert: function(G) {
            n.froalaEditor.html.insert(G, true)
        },
        editorSetHtml: function(G) {
            n.froalaEditor.html.set(G);
            if (G) {
				if(XF.isRtl()){
					n.froalaEditor.selection.setBefore("p");
				}else{
					n.froalaEditor.selection.setAfter("p");
				}
                n.froalaEditor.selection.restore();
            }
        },
        editorGetHtml: function() {
            return n.froalaEditor.html.get(true)
        },
        editorGetText: function() {
            return f.trim(n.froalaEditor.$el.text())
        },
        editorSetPlaceholder: function(H, G) {
            var I = " ";
            switch (H) {
            case "public":
                I = XF.phrase("siropu_chat_write_public_message");
                break;
            case "private":
                if (this.getConvCount()) {
                    I = "(" + G.data("username") + ") " + XF.phrase("siropu_chat_write_private_message")
                } else {
                    I = XF.phrase("siropu_chat_no_conversations_started")
                }
                break;
            case "posting":
                I = XF.phrase("siropu_chat_posting_message");
                break;
            case "wait":
                I = XF.phrase("siropu_chat_please_wait");
                break;
            case "readonly":
                I = XF.phrase("siropu_chat_room_is_read_only");
                break;
            case "noresponse":
                I = XF.phrase("siropu_chat_no_response");
                break;
            case "nopermission":
                I = XF.phrase("siropu_chat_do_not_have_permission_to_use");
                break
            }
            n.froalaEditor.opts.placeholderText = I;
            n.froalaEditor.placeholder.refresh();
        },
        editorOffPlaceholder: function(G) {
            this.editorOff();
            this.editorSetPlaceholder(G)
        },
        editorOnPlaceholder: function(G) {
            this.editorOn();
            this.editorSetPlaceholder(G)
        },
        loadSound: function(G) {
            return this.sounds[G] ? this.sounds[G] : new Audio(XF.config.url.basePath + "styles/default/siropu/chat/sounds/" + G + ".mp3")
        },
        postLogout: function() {
            var G = this.getRoomCount();
            for (var H in this.lastId) {
                this.leaveRoomPostActions(H, G != 0)
            }
            if (d.hasClass("siropuChatActiveTab")) {
                this.getRooms()
            } else {
                if (!G) {
                    d.click()
                }
            }
        },
        setChannel: function(G) {
            if (this.channel != G) {
                XF.Cookie.set("siropu_chat_channel", G);
                if (G == "room") {
                    this.userUpdateInterval = 30;
                    this.convUpdateInterval = 60
                } else {
                    this.userUpdateInterval = 60;
                    this.convUpdateInterval = 30
                }
            }
            this.channel = G
        },
        deleteOlderMessages: function(H, G) {
            if (H - this.serverTime >= 300 && G.find("> li[data-id]").length >= 100 && G.data("autoscroll") == 0) {
                G.find(">li[data-id]:nth-child(" + (this.inverse ? "" : "-") + "n+" + this.messageDisplayLimit + ")").remove();
                this.serverTime = H
            }
        },
        _initRoomListActions: function() {
            var G = this;
            f(u).on("click", ".siropuChatRoomInfo h3", function() {
                f(this).parents("li").find(".siropuChatRoomJoin").submit()
            });
            f(u).on("submit", ".siropuChatRoomAction form", function(J) {
                J.preventDefault();
                var I = f(this).find('button[type="submit"]');
                var H = f(this).find('input[name="password"]');
                if (H.length) {
                    H.toggle().focus();
                    if (!H.val()) {
                        return
                    }
                }
                I.prop("disabled", true);
                setTimeout(function() {
                    I.prop("disabled", false);
                    H.val("")
                }, 1000);
                XF.ajax("POST", f(this).attr("action"), {
                    password: H.val(),
                    users: G.getUserList()
                }, function(K) {
                    if (K.action == "join") {
                        G.loadRoom(K)
                    }
                    if (K.action == "leave") {
                        G.leaveRoomPostActions(K.roomId)
                    }
                    G.getRooms()
                })
            })
        },
        _initRoomActions: function() {
            var G = this;
            f(u).on("click", ".siropuChatRecipients", function() {
                var H = f(this).data("recipients").split(", ");
                G.editorInsert("/" + G.getCommand("whisper") + " [" + H.join(", ") + "] ")
            });
            f(u).on("click", ".siropuChatTag, .siropuChatUserTag", function(H) {
                var I = G.editorGetText();
                if (H.target.className.match("username")) {
                    H.preventDefault();
                    var J = f(this).text()
                } else {
                    var J = f(this).next("a").text()
                }
                G.editorInsert("@" + J + (I ? "" : ", "))
            })
        },
        _initSubmitForm: function() {
            var G = this;
            n.on("editor-initialized", function(J, H) {
		console.log("On init");
		n.froalaEditor = H; //n[0]["data-froala.editor"];
		console.log(H);
                var I = n.data("buttons-remove");
                if (!XF.isEditorEnabled() && I.match(/xfBbCode/)) {
                    XF.setIsEditorEnabled(true)
                }
                H.events.on("click", function(L) {
                    if (G.inConv()) {
                        var K = s.find('li[data-conv-id="' + G.convId + '"]');
                        if (K.hasClass("siropuChatNewMessage")) {
                            K.removeClass("siropuChatNewMessage")
                        }
                    }
                });
                if (G.joinCommand) {
                    H.events.on("keyup", function(L) {
                        var N = G.editorGetText();
                        var M = N.replace("/" + G.joinCommand, "").trim();
                        if (N.match(/\/join/) && M) {
                            var K = new XF.AutoCompleteResults({
                                onInsert: function(O) {
                                    G.editorSetHtml(N.replace(M, O));
                                    K.hideResults();
                                    c.submit()
                                }
                            });
                            XF.ajax("GET", XF.canonicalizeUrl("index.php?chat/room/find"), {
                                q: M
                            }, function(O) {
                                K.showResults(O.q, O.results, c)
                            }, {
                                global: false,
                                error: false
                            })
                        }
                    })
                }
                if (!G.canUseChat) {
                    G.editorOffPlaceholder("nopermission")
                } else {
                    if (G.inRoom() && D.find('a[data-room-id="' + G.roomId + '"]').data("readonly")) {
                        G.editorOffPlaceholder("readonly")
                    } else {
                        if (G.inRoom() && !G.getRoomCount() || G.inConv() && !G.getConvCount()) {
                            G.editorOffPlaceholder("")
                        }
                    }
                }
                if (B.hasClass("siropuChatPage") && !G.inIframe && !G.screenSizeIs("s")) {
                    G.editorFocus()
                }
                G.adjustContentHeight();
                G.adjustInputBox()
            });
            c.on("submit", function(L) {
                L.preventDefault();
                var I = G.editorGetHtml();
                var K = G.editorGetText();
                if (!XF.isEditorEnabled()) {
                    var H = e.find('textarea[name="message"]').val();
                    I = H;
                    K = H
                }
                if (!K && !f(I).find("img").length) {
                    return G.editorSetHtml("")
                }
                var M = f('.siropuChatMessages[data-room-id="' + G.roomId + '"]');
                var J = f('.siropuChatUsers[data-room-id="' + G.roomId + '"]');
                G.preSubmit();
                XF.ajax("POST", XF.canonicalizeUrl("index.php?chat/submit"), {
                    users: G.getUserList(),
                    channel: G.channel,
                    room_id: G.roomId,
                    last_id: G.lastId,
                    conv_id: G.convId,
                    conv_items: G.getConvItems(),
                    conv_unread: G.convUnread,
                    message_html: I
                }, function(N) {
                    if (N.roomIdle) {
                        J.find('> li[data-user-id="' + G.userId + '"]').remove();
                        G.removeUserFromActiveUsers(G.roomId, G.userId);
                        if (!G.activeUsers[G.roomId].length) {
                            G.addNoRoomUsersMessage(J)
                        }
                        G.postSubmit();
                        return
                    }
                    if (N.input) {
                        G.editorSetHtml(N.input)
                    }
                    if (N.roomTab) {
                        G.loadRoom(N);
                        G.postSubmit();
                        return
                    }
                    if (N.find !== undefined) {
                        f(".siropuChatMessages:visible").html(f(N.messages)).attr("data-search", N.find);
                        G.doAutoScroll();
                        G.postSubmit();
                        return
                    }
                    if (N.leaveRoom) {
                        G.leaveRoomPostActions(N.leaveRoom, true)
                    }
                    if (N.leaveConv) {
                        G.leaveConversationPostActions(N)
                    }
                    if (N.logout) {
                        G.postLogout()
                    }
                    if (N.html) {
                        XF.setupHtmlInsert(N.html, function(O, P) {
                            if (O.length) {
                                XF.overlayMessage(P.title, O)
                            }
                        })
                    }
                    if (N.prune) {
                        if (N.prune == "all") {
                            f(".siropuChatMessages[data-room-id]").html("");
                            G.lastId = {}
                        } else {
                            if (N.prune == "room") {
                                M.html("")
                            } else {
                                if (N.prune.user_id) {
                                    M.find('> li[data-user-id="' + N.prune.user_id + '"]').remove()
                                } else {
                                    if (N.prune.rows) {
                                        if (G.inverse) {
                                            M.find("> li").slice(0, Number(N.prune.rows)).remove()
                                        } else {
                                            M.find("> li").slice(Number(-N.prune.rows)).remove()
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (N.sanctioned) {
                        J.find('> li[data-user-id="' + N.sanctioned + '"]').remove()
                    }
                    G.updateRooms(N);
                    G.updateConversations(N);
                    G.updateNotice(N);
                    G.updateActivityStatus(N);
                    if (G.getFloodCheck()) {
                        G.editorSetPlaceholder("wait")
                    }
                    setTimeout(function() {
                        G.postSubmit()
                    }, G.getFloodCheck());
                    if (G.inConv()) {
                        G.convLastActive = N.serverTime
                    }
                }, {
                    global: false
                })
            })
        },
        _initTabs: function() {
            var G = this;
            D.on("click", "a", function(J, H) {
                J.preventDefault();
                f(this).removeClass("siropuChatNewMessage");
                w.find("> *").hide();
                D.find("a.siropuChatActiveTab").removeClass("siropuChatActiveTab");
                f(this).addClass("siropuChatActiveTab");
                G.editorSetPlaceholder("public");
                G.updateHeaderTitle(f(this));
                var I = f(this).data("target");
                switch (I) {
                case "room":
                    G.roomId = f(this).data("room-id");
                    G.roomFloodCheck = f(this).data("flood-check");
                    XF.Cookie.set("siropu_chat_room_id", G.roomId);
                    w.find('[data-room-id="' + G.roomId + '"]').show();
                    if (f(this).data("readonly")) {
                        G.editorOffPlaceholder("readonly")
                    } else {
                        G.editorOnPlaceholder("public")
                    }
                    if (G.isResponsive()) {
                        f(".siropuChatRoom.siropuChatUsers").hide()
                    } else {
                        if (!H) {
                            G.editorFocus()
                        }
                    }
                    G.autoScroll();
                    break;
                case "room-list":
                    F.toggle();
                    G.getRooms();
                    G.editorOffPlaceholder("");
                    break;
                case "conv-list":
                    s.show();
                    G.orderConversations();
                    if (G.getConvCount()) {
                        s.find('li[data-conv-id="' + G.convId + '"]').trigger("click", true)
                    } else {
                        G.editorOffPlaceholder("")
                    }
                    break;
                case "conv-form":
                    r.show();
                    if (!G.screenSizeIs("s")) {
                        r.find("input").focus()
                    }
                    G.editorOffPlaceholder("");
                    break
                }
                G.setChannel(I.match(/room/) ? "room" : "conv")
            })
        },
        _initConversations: function() {
            var G = this;
            s.on("click", "li[data-conv-id]", function(I, H) {
                G.convId = f(this).data("conv-id");
                XF.Cookie.set("siropu_chat_conv_id", G.convId);
                G.updateHeaderTitle(f(this));
                f(this).removeClass("siropuChatNewMessage");
                f(".siropuChatConversation.siropuChatMessages").hide();
                f(this).addClass("siropuChatActiveConversation").siblings().removeClass("siropuChatActiveConversation");
                var K = f('.siropuChatConversation.siropuChatMessages[data-conv-id="' + G.convId + '"]');
                if (K.find("> li").length) {
                    K.show();
                    G.autoScroll(K);
                    G.markCurrentConversationAsRead()
                } else {
                    var J = f('<li class="siropuChatLoadingMessages" />');
                    J.html(XF.phrase("siropu_chat_loading_conversation_messages"));
                    K = G.createConversationMessageContainer(G.convId);
                    K.html(J).insertBefore(r).show();
                    G._initAutoScrollToggle(K);
                    XF.ajax("POST", XF.canonicalizeUrl("index.php?chat/conversation/" + G.convId + "/load-messages"), {
                        conv_unread: G.convUnread[G.convId]
                    }, function(L) {
                        K.html(L.messages);
                        XF.activate(K);
                        setTimeout(function() {
                            G.doAutoScroll(K)
                        })
                    })
                }
                G.editorOn();
                G.editorSetPlaceholder("private", f(this));
                if (!G.inverse && K.find("iframe").length) {
                    setTimeout(function() {
                        G.autoScroll(K)
                    }, 1000)
                }
                if (G.isResponsive()) {
                    if (H) {
                        K.hide()
                    } else {
                        s.hide()
                    }
                } else {
                    if (!H) {
                        G.editorFocus()
                    }
                }
            });
            s.on("mouseover mouseout", "> li", function() {
                f(this).find(".siropuChatConversationActions").toggle()
            })
        },
        _initOnLoad: function() {
            if (this.inverse) {
                return
            }
            var G = this;
            f(".siropuChatMessages:visible .bbImage").on("load", function() {
                G.doAutoScroll()
            })
        },
        _initAutoScrollToggle: function(H) {
            var G = this;
            var H = H ? H : f(".siropuChatMessages");
            H.scroll(function() {
                G.toggleAutoScroll(f(this))
            })
        },
        _initSounds: function() {
            this.sounds.normal = this.getSoundSetting("normal") ? this.loadSound("normal") : "";
            this.sounds.whisper = this.getSoundSetting("whisper") ? this.loadSound("whisper") : "";
            this.sounds["private"] = this.getSoundSetting("private") ? this.loadSound("private") : "";
            this.sounds.mention = this.getSoundSetting("mention") ? this.loadSound("tag") : "";
            this.sounds.bot = this.getSoundSetting("bot") ? this.loadSound("bot") : "";
            this.sounds.error = this.getSoundSetting("bot") ? this.loadSound("error") : ""
        },
        getChannel: function() {
            return this.channel
        },
        getRoomId: function() {
            return this.roomId
        },
        getConvId: function() {
            return this.convId
        },
        inRoom: function() {
            return this.channel == "room"
        },
        inConv: function() {
            return this.channel == "conv"
        },
        escapeRegExp: function(G) {
            return isNaN(G) ? G.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") : G
        },
        addBarNewMessageClass: function() {
            if (l && !this.isVisible) {
                z.addClass("siropuChatNewMessage")
            }
        },
        removeUserFromActiveUsers: function(H, G) {
            var I = this.activeUsers[H];
            this.activeUsers[H] = I.filter(function(J) {
                return J != G
            })
        },
        addNoRoomUsersMessage: function(G) {
            G.html(f('<li class="siropuChatNoRoomUsers" />').html(XF.phrase("siropu_chat_no_one_is_chatting")))
        }
    });
    XF.SiropuChat.Form = XF.Element.newHandler({
        options: {
            edit: false,
            multiLine: false
        },
        init: function() {
            var H = this;
            var I = this.$target;
            var G = I.find("textarea");
            G.on("editor-initialized", function(K, J) {
		console.log(J);
		G.froalaEditor = J;
                J.opts.pastePlain = true;
                J.opts.multiLine = H.options.multiLine;
                J.opts.htmlAllowedTags = ["img", "a", "table", "tr", "td"];
                J.events.on("keydown", function(L) {
                    if (L.which == 13) {
                        if (H.options.multiLine && L.shiftKey) {
                            return L.preventDefault()
                        }
                        I.submit();
                        if (H.options.edit) {
                            I.find(".js-overlayClose").click()
                        }
                    }
                });
                if (H.options.edit) {
                    setTimeout(function() {
                        G.froalaEditor.events.focus();
						if (XF.isRtl()){
							G.froalaEditor.selection.setBefore("p");
						}else{
							G.froalaEditor.selection.setAfter("p");
						}
                        G.froalaEditor.selection.restore()
                    }, 500)
                } else {
                    G.froalaEditor.html.set("")
                }
            });
            f("#siropuChatEditor").on("keyup", "textarea", function(J) {
                if (J.which == 13 && !XF.isEditorEnabled() && !H.options.multiLine) {
                    I.submit()
                }
            })
        }
    });
    XF.SiropuChat.Messages = XF.Element.newHandler({
        options: {},
        init: function() {
            f('a[data-xf-click="siropu-chat-quote"]').remove();
            this.$target.on("mouseover mouseout", ".siropuChatMessageRow", function() {
                if (f(this).find(".siropuChatMessageActions").length) {
                    f(this).find(".siropuChatDateTime, .siropuChatMessageActions").toggle()
                }
            })
        }
    });
    XF.SiropuChat.FindRooms = XF.Element.newHandler({
        options: {},
        init: function() {
            this.$target.on("keyup", function() {
                var H = f(this).val().trim();
                var G = new RegExp(H,"gi");
                f("#siropuChatRooms > li[data-room-name]").hide().each(function() {
                    if (f(this).data("room-name").match(G)) {
                        f(this).show()
                    }
                })
            })
        }
    });
    XF.SiropuChat.StartConversationForm = XF.Element.newHandler({
        options: {},
        init: function() {
            var G = this;
            this.$target.on("submit", function(J) {
                J.preventDefault();
                var I = f(this).find("input");
                var H = f(this).find("textarea");
                if (!I.val().trim()) {
                    return I.focus()
                }
                if (!H.val().trim()) {
                    return H.focus()
                }
                XF.ajax("POST", f(this).attr("action"), f(this).serialize() + "&conv_items=" + XF.SiropuChat.Core.prototype.getConvItems(), function(K) {
                    k = f("#siropuChatNoConversations");
                    if (k.length) {
                        k.remove()
                    }
                    XF.SiropuChat.Core.prototype.updateConversations(K);
                    D.find('a[data-target="conv-list"]').click();
                    I.val("");
                    H.val("")
                })
            })
        }
    });
    XF.SiropuChat.LeaveConversation = XF.Element.newHandler({
        options: {},
        init: function() {
            this.$target.on("ajax-submit:response", f.proxy(this, "ajaxResponse"))
        },
        ajaxResponse: function(H, G) {
            XF.SiropuChat.Core.prototype.updateConversations(G);
            XF.SiropuChat.Core.prototype.leaveConversationPostActions(G)
        }
    });
    XF.SiropuChat.Like = XF.Click.newHandler({
        eventNameSpace: "SiropuChatLike",
        init: function() {},
        click: function(H) {
            H.preventDefault();
            var G = this;
            XF.ajax("POST", this.$target.attr("href"), function(I) {
                if (I.html) {
                    XF.setupHtmlInsert(I.html, function(J, K, L) {
                        if (J.length) {
                            G.$target.parents(".siropuChatMessageRow").replaceWith(J)
                        }
                    })
                }
            })
        }
    });
    XF.SiropuChat.Unlike = XF.Click.newHandler({
        eventNameSpace: "SiropuChatUnlike",
        init: function() {},
        click: function(H) {
            H.preventDefault();
            var G = this;
            XF.ajax("POST", this.$target.attr("href"), function(I) {
                if (I.html) {
                    XF.setupHtmlInsert(I.html, function(J, K, L) {
                        if (J.length) {
                            G.$target.parents(".siropuChatMessageRow").replaceWith(J)
                        }
                    })
                }
            })
        }
    });
    XF.SiropuChat.Quote = XF.Click.newHandler({
        eventNameSpace: "SiropuChatQuote",
        init: function() {},
        click: function(G) {
            G.preventDefault();
            XF.ajax("POST", this.$target.attr("href"), function(H) {
                if (H.quote) {
                    XF.SiropuChat.Core.prototype.editorSetHtml(H.quoteHtml)
                }
            })
        }
    });
    XF.SiropuChat.LeaveRoom = XF.Click.newHandler({
        eventNameSpace: "SiropuChatLeaveRoom",
        init: function() {},
        click: function(H) {
            H.preventDefault();
            var G = this;
            XF.ajax("POST", this.$target.attr("href"), function(I) {
                XF.SiropuChat.Core.prototype.leaveRoomPostActions(I.roomId, true);
                G.$target.parent(".menu").toggle()
            })
        }
    });
    XF.SiropuChat.Whisper = XF.Click.newHandler({
        eventNameSpace: "SiropuChatWhisper",
        options: {
            username: ""
        },
        init: function() {},
        click: function(N) {
            var P = this.$target.parents(".menu").attr("id");
            var I = XF.SiropuChat.Core.prototype.editorGetText();
            var J = XF.SiropuChat.Core.prototype.getCommand("whisper");
            var G = [];
            G.push(this.options.username);
            if (I.match(/\[(.*?)\]/)) {
                var Q = I.indexOf("[");
                var K = I.indexOf("]");
                var M = I.substring(Q + 1, K);
                if (M.length) {
                    var O = M.split(",");
                    for (var L in O) {
                        G.push(O[L].trim())
                    }
                }
                if (M.match(XF.SiropuChat.Core.prototype.escapeRegExp(this.options.username))) {
                    G = G.filter(function(R) {
                        return R != this.options.username
                    })
                }
            }
            var H = "";
            if (G.length) {
                H = "/" + J + " [" + G.join(", ") + "] "
            }
            XF.SiropuChat.Core.prototype.editorInsert(H)
        }
    });
    XF.SiropuChat.LoadMoreMessages = XF.Click.newHandler({
        eventNameSpace: "siropuChatLoadMoreMessages",
        init: function() {},
        click: function(J) {
            J.preventDefault();
            var K = this.$target;
            if (K.data("complete")) {
                return
            }
            var L = K.parents("ul.siropuChatMessages");
            var H = L.data("room-id");
            var M = L.data("conv-id");
            var O = L.attr("data-search");
            var I = XF.SiropuChat.Core.prototype.getMiscSetting("inverse");
            if (I) {
                var N = L.find("> li[data-id]:last")
            } else {
                var N = L.find("> li[data-id]:first")
            }
            if (H) {
                var G = "room/" + H
            } else {
                var G = "conversation/" + M
            }
            XF.ajax("GET", XF.canonicalizeUrl("index.php?chat/" + G + "/load-more-messages"), {
                message_id: N.data("id"),
                find: O
            }, function(P) {
                if (P.messages) {
                    if (I) {
                        N.after(P.messages)
                    } else {
                        N.before(P.messages).get(0).scrollIntoView({
                            behavior: "smooth",
                            block: "nearest",
                            inline: "start"
                        })
                    }
                    XF.activate(N.parent())
                }
                if (!P.hasMore) {
                    K.attr("data-complete", true);
                    K.html(XF.phrase("siropu_chat_all_messages_have_been_loaded"));
                    setTimeout(function() {
                        K.fadeOut()
                    }, 5000)
                }
            })
        }
    });
    XF.SiropuChat.EditNotice = XF.Element.newHandler({
        options: {},
        init: function() {
            this.$target.on("ajax-submit:response", f.proxy(this, "ajaxResponse"))
        },
        ajaxResponse: function(H, G) {
            if (G.message) {
                XF.flashMessage(G.message, 2000)
            }
            XF.SiropuChat.Core.prototype.updateNotice(G)
        }
    });
    XF.SiropuChat.ToggleUsers = XF.Click.newHandler({
        eventNameSpace: "siropuChatToggleUsers",
        init: function() {},
        click: function(I) {
            var H = XF.SiropuChat.Core.prototype.getChannel();
            var G = XF.SiropuChat.Core.prototype.getRoomId();
            var J = XF.SiropuChat.Core.prototype.getConvId();
            if (H == "room") {
                f('.siropuChatUsers[data-room-id="' + G + '"]').toggle();
                f('.siropuChatMessages[data-room-id="' + G + '"]').toggle()
            } else {
                s.toggle();
                f('.siropuChatMessages[data-conv-id="' + J + '"]').toggle()
            }
        }
    });
    XF.SiropuChat.ToggleOptions = XF.Click.newHandler({
        eventNameSpace: "siropuChatToggleOptions",
        init: function() {},
        click: function(H) {
            var G = this.$target.parents("fieldset").find("input");
            G.prop("checked", G.filter(":checked").length ? false : true);
            C.change()
        }
    });
    XF.SiropuChat.ToggleConvForm = XF.Click.newHandler({
        eventNameSpace: "siropuChatToggleConvForm",
        init: function() {},
        click: function(H) {
            var G = this.$target.parent(".siropuChatUserMenu").find("form");
            G.toggle();
            if (!XF.SiropuChat.Core.prototype.screenSizeIs("s")) {
                G.find("textarea").focus()
            }
        }
    });
    XF.SiropuChat.ResetColor = XF.Click.newHandler({
        eventNameSpace: "SiropuChatResetColor",
        init: function() {},
        click: function(H) {
            var G = C.find(".colorPickerBox");
            G.removeClass("is-active");
            G.find(".colorPickerBox-sample").attr("style", "");
            C.find('input[name="message_color"]').val("");
            C.trigger("change")
        }
    });
    XF.SiropuChat.Logout = XF.Element.newHandler({
        options: {},
        init: function() {
            this.$target.on("ajax-submit:response", f.proxy(this, "ajaxResponse"))
        },
        ajaxResponse: function(H, G) {
            if (G.errors || G.exception) {
                return
            }
            H.preventDefault();
            if (G.message) {
                XF.flashMessage(G.message, 3000)
            }
            XF.SiropuChat.Core.prototype.postLogout()
        }
    });
    XF.SiropuChat.TextSelect = XF.Element.newHandler({
        options: {},
        init: function() {
            var G = this;
            setTimeout(function() {
                G.$target.select().focus()
            }, 500)
        }
    });
    XF.SiropuChat.EditorButton = {
        init: function() {
            XF.SiropuChat.EditorButton.initializeDialog();
            XF.EditorHelpers.dialogs.chat = new XF.SiropuChat.EditorDialogGallery("chat");
            if (f.FE.COMMANDS.xfCustom_chat) {
                f.FE.COMMANDS.xfCustom_chat.callback = XF.SiropuChat.EditorButton.callback
            }
        },
        initializeDialog: function() {
            XF.SiropuChat.EditorDialogGallery = XF.extend(XF.EditorDialog, {
                cache: false,
                _init: function(J) {
                    var I = this;
                    var H = J.$container;
                    var G = H.find(".formSubmitRow-controls");
                    f(".siropuChatDialogInsert").click(function(K) {
                        K.preventDefault();
                        f(".js-attachmentFileSelected").each(function() {
                            I.ed.image.insert(f(this).data("url"))
                        });
                        I.overlay.hide()
                    });
                    f(".siropuChatDialogDelete").click(function(L) {
                        L.preventDefault();
                        var K = [];
                        f(".js-attachmentFileSelected").each(function() {
                            K.push(f(this).data("attachment-id"))
                        });
                        if (K.length) {
                            XF.ajax("POST", XF.canonicalizeUrl("index.php?chat/delete-attachments"), {
                                hash: H.find('input[name="hash"]').val(),
                                remove: K,
                            }, function(M) {
                                if (M.success) {
                                    f(".js-attachmentFileSelected").remove();
                                    if (!H.find(".js-attachmentFile").length) {
                                        G.fadeOut()
                                    }
                                }
                            })
                        }
                    });
                    H.on("click", ".js-attachmentFile", function() {
                        f(this).toggleClass("js-attachmentFileSelected");
                        if (H.find(".js-attachmentFileSelected").length) {
                            G.fadeIn()
                        } else {
                            G.fadeOut()
                        }
                    })
                }
            })
        },
        callback: function() {
            XF.EditorHelpers.loadDialog(this, "chat")
        }
    };
    f(u).on("editor:first-start", XF.SiropuChat.EditorButton.init);
    XF.Element.register("siropu-chat", "XF.SiropuChat.Core");
    XF.Element.register("siropu-chat-form", "XF.SiropuChat.Form");
    XF.Element.register("siropu-chat-messages", "XF.SiropuChat.Messages");
    XF.Element.register("siropu-chat-find-rooms", "XF.SiropuChat.FindRooms");
    XF.Element.register("siropu-chat-start-conversation-form", "XF.SiropuChat.StartConversationForm");
    XF.Element.register("siropu-chat-leave-conversation", "XF.SiropuChat.LeaveConversation");
    XF.Element.register("siropu-chat-edit-notice", "XF.SiropuChat.EditNotice");
    XF.Element.register("siropu-chat-logout", "XF.SiropuChat.Logout");
    XF.Element.register("siropu-chat-text-select", "XF.SiropuChat.TextSelect");
    XF.Click.register("siropu-chat-like", "XF.SiropuChat.Like");
    XF.Click.register("siropu-chat-unlike", "XF.SiropuChat.Unlike");
    XF.Click.register("siropu-chat-quote", "XF.SiropuChat.Quote");
    XF.Click.register("siropu-chat-whisper", "XF.SiropuChat.Whisper");
    XF.Click.register("siropu-chat-leave-room", "XF.SiropuChat.LeaveRoom");
    XF.Click.register("siropu-chat-load-more-messages", "XF.SiropuChat.LoadMoreMessages");
    XF.Click.register("siropu-chat-toggle-users", "XF.SiropuChat.ToggleUsers");
    XF.Click.register("siropu-chat-toggle-options", "XF.SiropuChat.ToggleOptions");
    XF.Click.register("siropu-chat-toggle-conv-form", "XF.SiropuChat.ToggleConvForm");
    XF.Click.register("siropu-chat-reset-color", "XF.SiropuChat.ResetColor")
}(jQuery, window, document);
