var Controller = require("./controller.js");
var Admin = {};

Admin.showController = false;
Admin.lastCommand = "";

Admin.playerNum = 0;

/*
 * mithril lifecycle methods for auto redraw
 */

Admin.oninit = function() {
    Admin.stateList = [];
    window.setInterval(function() {
        m.redraw();
    }, 1000);

    // Request scenes information (Hacky)
    var socketio = window.socket.getSocket();
    socketio.emit("admin_getstates");
    socketio.on("admin_getstates", function(data) {
        Admin.stateList = data;
        m.redraw();
    });
};

Admin.onremove = function() {
};


Admin.getMessages = function() {
    return window.socket.debugMessages.join("\n");
};

Admin.selectState = function(val) {
    if (val === "-1") {
        return;
    }
    if (window.confirm("Change state?")) {
        window.socket.socketio.emit("admin_setstate", val);
    }
};

Admin.genStateOptions = function() {
    var options = [m("option[value='-1']", "-----")];
    for (var i = 0; i < Admin.stateList.length; i++) {
        options.push(m("option", {value: i}, Admin.stateList[i]));
    }

    return options;
};

Admin.view = function() {
    var socket = window.socket;

    if (!Admin.showController) {
        return m("div.admin", [
            m("textarea[rows=8]", {
                value: Admin.getMessages(),
                style: { width: "100%" }
            }),

            /*
             * Buttons
             */
            m("a.admin-button", {
                onclick: function() {
                    var cmd = window.prompt("Run command:");
                    socket.adminEval(cmd);
                    Admin.lastCommand = cmd;
                },
                style: { "background-color": "yellow" }
            }, "Run command"),

            m("a.admin-button", {
                onclick: function() {
                    if (window.confirm("Repeat Command: " + Admin.lastCommand + "?")) {
                        socket.adminEval(Admin.lastCommand);
                    }
                },
                style: { "background-color": "orange" }
            }, "Repeat cmd"),

            m("a.admin-button", {
                onclick: function() {
                    socket.getInfo();
                },
                style: { "background-color": "beige" }
            }, "Get info"),

            m("a.admin-button", {
                onclick: function() {
                    if (window.confirm("Next scene?")) {
                        socket.nextState();
                    }
                },
                style: { "background-color": "pink" }
            }, "Next Scene"),

            m("a.admin-button", {
                onclick: function() {
                    Admin.showController = true;
                    Admin.playerNum = 0;
                },
                style: { "background-color": "lime" }
            }, "Controller"),

            m("a.admin-button", {
                onclick: function() {
                    socket.getSocket().emit("admin_enter");
                    if (window.confirm("Enable player inputs?")) {
                        socket.getSocket().emit("admin_enable_inputs");
                    }
                },
                style: { "background-color": "red" }
            }, "Press Start"),

            m("a.admin-button", {
                onclick: function() {
                    socket.getSocket().emit("admin_start_survey");
                },

                style: { "background-color": "white" }
            }, "Start Survey"),


            // State Selector
            m("select.admin-sceneselect", {
                onchange: function(e) { Admin.selectState(e.target.value); }
            }, Admin.genStateOptions()),




        ]);
    }
    else {
        return [
            Controller.controllerView({player_num: Admin.playerNum}),

            // Select player number
            m("div.admin-controller",
                m("select[id='admin-player-num']", {
                    onchange: function(e) {
                        Admin.playerNum = parseInt(e.target.value);
                    }
                },
                    [
                        m("option[value='0']", "P1"),
                        m("option[value='1']", "P2"),
                        m("option[value='2']", "P3"),
                        m("option[value='3']", "P4"),
                    ])
            ),

            m("a", {
                onclick: function() { Admin.showController = false; },
                style: {
                    position: "fixed",
                    bottom: "0",
                    left: "40px",
                    "background-color": "fuchsia"
                }
            }, "BACK")
        ];
    }
};

module.exports = Admin;
