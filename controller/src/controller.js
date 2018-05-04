var Util = require("./util.js");

/////////////////
// GLOBALS
var PRESSED = {
};
var curDirection = null;
var curDirectionCoords = [0, 0];

var DIRECTIONS = ["UP", "RIGHT", "DOWN", "LEFT"];
/////////////////


var SOCKETIO = window.socket.getSocket();

function isAdjacent(dir1, dir2) {
    var d1 = DIRECTIONS.indexOf(dir1);
    var d2 = DIRECTIONS.indexOf(dir2);

    if (d1 === -1 || d2 === -1) { return false; }

    return Math.abs(d1-d2) === 3 || Math.abs(d1-d2) === 1;
}

function directionalOnTouchMove(e, adminOptions) {
    var t = e.targetTouches[0];
    var b = getDirectionalButton(t.clientX, t.clientY);
    var newDir = b[0];
    var stickDistance = b[1];
    var isAdj = isAdjacent(newDir, curDirection);

    // If direction changed
    if (newDir !== curDirection && (!isAdj || stickDistance > 30)) {
        console.log("isAdj? " + isAdj + ", dist: " + stickDistance);
        brelease(curDirection, adminOptions);
        bpress(newDir, adminOptions);
    }
}

function directionalOnTouchStart(e, adminOptions) {
    e.preventDefault();

    var t = e.targetTouches[0];
    var b = getDirectionalButton(t.clientX, t.clientY);

    bpress(b[0], adminOptions);
}

function genDirectional(dirType, adminOptions) {
    var opts = adminOptions;

    return function(e) {
        if (dirType === "move") {
            directionalOnTouchMove(e, opts);
        } else if (dirType === "start") {
            directionalOnTouchStart(e, opts);
        }
    };
}

var BUTTONS = {
    "A": {
        x: 80,
        y: 40,
        w: 20,
        h: 40,
        color: "#57FF22",
        text: "A"
    },
    "B": {
        x: 60,
        y: 40,
        w: 20,
        h: 40,
        color: "#FF3149",
        text: "B"

    },
    "X": {
        x: 70,
        y: 15,
        w: 30,
        h: 25,
        color: "#909090",
        text: "Jump"
    },

    "DIRECTIONAL": {
        x: 0,
        y: 15,
        w: 40,
        h: 70,
        color: "white",
        class: "circle",
        text: "",

        // Commented for admin hack in genButton
        // ontouchmove: directionalOnTouchMove,
        // ontouchstart: directionalOnTouchStart
    },

    "DUP": {
        x: 40,
        y: 10,
        w: 20,
        h: 10,
        color: "pink",
        text: "Taunt"
    }
};

function getDirectionalButton(x, y) {
    // First, set curDirectionCoords
    curDirectionCoords = [x, y];

    var props = BUTTONS.DIRECTIONAL;

    var x1 = px(props.x, getWidth(), true);
    var y1 = px(props.y, getHeight(), true);

    var w = px(props.w, getWidth(), true);
    var h = px(props.h, getHeight(), true);

    var cx = x1 + w/2;
    var cy = y1 + h/2;

    var deg = Math.atan((y-cy)/(x-cx))*(180/Math.PI) + 90;
    if (x < x1 + w/2) {
        deg += 180;
    }

    var dir;

    if (deg > 315) {
        dir = "UP"; // Left side of up
    } else if (deg > 225) {
        dir = "LEFT";
    } else if (deg > 135) {
        dir = "DOWN";
    } else if (deg > 45) {
        dir = "RIGHT";
    } else {
        dir = "UP"; // Right side of up
    }

    return [dir, Math.sqrt(Math.pow(x-cx, 2) + Math.pow(y-cy, 2))];
}
window.getDirectionalButton = getDirectionalButton;

var Controller = {};

function getWidth() {
    return window.innerWidth;
}

function getHeight() {
    return window.innerHeight;
}

function px(x, relative, numOnly) {
    if (relative) {
        x = (x/100) * relative;
    }

    if (numOnly) { return x; }

    return x + "px";
}


function bpress(button, adminOptions) {
    if (DIRECTIONS.indexOf(button) >= 0) {
        curDirection = button;
    }

    /*
     * Admin controller
     */
    if (adminOptions) {
        SOCKETIO.emit("admin_bpress", { player_num: adminOptions.player_num, key: button });
    }

    else if (button) {
        // CHANGE
        SOCKETIO.emit("bpress", button);

        PRESSED[button] = true;
        Util.vibrate(25);
    }
}


function brelease(button, adminOptions) {
    if (DIRECTIONS.indexOf(button) >= 0) {
        curDirection = null;
    }
    if (button === "DIRECTIONAL" && curDirection) {
        button = curDirection;
        curDirection = null;
    }

    /*
     * Admin controller
     */
    if (adminOptions) {
        SOCKETIO.emit("admin_brelease", { player_num: adminOptions.player_num, key: button });
    }

    else if (PRESSED[button]) {
        SOCKETIO.emit("brelease", button);
    }
    delete PRESSED[button];
}

Controller.genButton = function(button, adminOptions) {
    var props = BUTTONS[button];

    /*
     * Admin hack
     */
    if (button === "DIRECTIONAL") {
        props.ontouchmove = genDirectional("move", adminOptions);
        props.ontouchstart = genDirectional("start", adminOptions);
    }

    var style = {
        "style": {
            "left": px(props.x, getWidth()),
            "top": px(props.y, getHeight()),

            "width": px(props.w, getWidth()),
            "height": px(props.h, getHeight()),
            "line-height": px(props.h, getHeight()),
            "background-color": props.color
        },

        "ontouchstart": function(e){
            bpress(button, adminOptions);
        },

        "ontouchend": function(e){
            e.preventDefault();

            brelease(button, adminOptions);
        },

        "ontouchcancel": function(e){
            e.preventDefault();

            brelease(button, adminOptions);
        }

    };
    var text = props.text || button;
    if (text === "DIRECTIONAL") { 
        text = "";
    }

    style.class = props.class || "button";

    style.ontouchstart = props.ontouchstart || style.ontouchstart;
    style.ontouchmove = props.ontouchmove || function(){};

    return m("a", style, text);
};


/*
 * VIEW
 */
Controller.controllerView = function(adminOptions) {
    var p = BUTTONS.DIRECTIONAL;
    var stickStyle = curDirection?
        {
            left: px(curDirectionCoords[0] - 50),
            top: px(curDirectionCoords[1] - 50),
        } :
        {
            left: px(p.x, getWidth(), true) + 0.5*px(p.w, getWidth(), true) - 50 + "px",
            top: px(p.y, getHeight(), true) + 0.5*px(p.h, getHeight(), true) - 50 + "px",
        };


    var debugResetButton = m("a.button", {
        style: {
            "background-color": "red"
        },
        onclick: function() {
            window.localStorage.clear();
            alert("Cleared localStorage");
        }
    }, "Reset");


    return m("div.controller", [
        Object.keys(BUTTONS).map(function(key) {
            return Controller.genButton(key, adminOptions);
        }),

        // Debug resetting
        // window.DEBUG? debugResetButton : "",

        m("div.debug-dir", Object.keys(PRESSED)),
        // m("div.debug-dir", "dir: " + curDirection),
        m("div.status", "Status: " + window.socket.status),



        adminOptions? "" : m("img[src='stick100.png']", {
            class: "stick",
            style: stickStyle,

            ontouchmove: genDirectional("move", adminOptions),
            ontouchstart: genDirectional("start", adminOptions),
            "ontouchend": function(e){
                e.preventDefault();

                brelease("DIRECTIONAL", adminOptions);
            },

            "ontouchcancel": function(e){
                e.preventDefault();

                brelease("DIRECTIONAL", adminOptions);
            }
        })
    ]);
};

Controller.view = function() {
    return [
        Controller.controllerView(),

        m("div.modal[id='mymodal']",
            m("div.modal-content", [
                m("span.close", {
                    onclick: function() { document.getElementById("mymodal").style.display = "none"; }
                }, "×"),
                m("h2", "Welcome to Smash, the multimedia experience (BETA)"),
                m("p", "1. Hold your phone horizontally (landscape) like a game controller"),
                m("p", "2. Be ready to play when you see your name displayed on the screen"),
                m("p", "3. Check the program for more detailed instructions. Enjoy!"),
            ])
        )
    ];
};

Controller.oninit = function() {
    console.log("controller init");

    if (!socket.isLoggedIn()) {
        m.route.set("/login");
    }
};

module.exports = Controller;
