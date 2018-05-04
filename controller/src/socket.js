
var Socket = function(host) {
    this.loggedIn = false;

    this.debugMessages = [];

    this.createSocket(host);


    this.username = "";
    this.character = "";
    this.secret = "";
    this.status = "Disconnected";
};

Socket.prototype.login = function(username, character) {
    this.character = character;
    this.loggedIn = false;

    // var secret = window.localStorage.getItem("secret") || this.secret || "";
    var secret = this.secret || "";

    console.log("logging in with secret: " + secret);

    this.socketio.emit("login", {username: username, character: character, secret: secret});
};

Socket.prototype.isLoggedIn = function() {
    return this.loggedIn;
};

Socket.prototype.getSocket = function() {
    return this.socketio;
};

Socket.prototype.logMessage = function(msg, msgType) {
    var s = msgType? msgType + ": " : "";

    s += msg;

    console.log("Socket: " + s);
    this.debugMessages.unshift(s);
};

Socket.prototype.createSocket = function(host) {
    /*
     * Socket stuff
     */

    var socketio = io(host);
    // var socketio = io(host, {transports: ["websocket"]});

    var self = this;

    socketio.on('connect', function(){
        console.log("connect?");
    });

    socketio.on('disconnect', function(){
        console.log("disconnect?");
        self.status = "Disconnected. Reconnecting...";
        m.redraw();
    });

    socketio.on('reconnecting', function() {
        // self.status = "Reconnecting...";
        m.redraw();
    });

    socketio.on("reconnect", function() {
        console.log("reconnected!");

        if (m.route.get() == "/controller") {
            self.login(self.username, self.character);
        }
    });

    socketio.on("login_success", function(data) {
        console.log("login success starts");
        console.log("username:"+data.username);
        console.log("secret:"+data.secret);

        // Store username and secret
        self.username = data.username;
        self.secret = data.secret;
        self.status = "Connected";

        self.loggedIn = true;

        // try {
        //     // Store login credentials
        //     window.localStorage.setItem("userame", data.username);
        //     window.localStorage.setItem("secret", data.secret);
        // } catch (e) {
        //     console.log("localStorage not supported, should be alright though");
        // }

        console.log("login success:");
        console.log(data);

        // Do something (show to user? TODO:)
        m.route.set("/controller");
    });

    socketio.on("login_failure", function(data) {
        self.loggedIn = false;

        // Clear existing credentials
        window.localStorage.clear();

        console.log("login_failure");
        // Set loggedin to false

        if (m.route.get() == "/login") {
            alert("Username already taken. Choose another username");
            window.loginIsLoading = false;
            m.redraw();
        }
        else if (m.route.get() == "/controller") {
            m.route.set("/login");
        }
    });


    socketio.on("admin_eval", function(data) {
        console.log(data);
        self.logMessage(data, "ADMIN_EVAL");
    });

    socketio.on("admin_alert", function(data) {
        alert(data);
    });

    socketio.on("admin_get_info", function(data) {
        // Get players
        var players = [];
        Object.keys(data.players).forEach(function(k) {
            players.push(data.players[k] + ": " + k);
        });

        players.sort();
        var s1 = players.join("\n");

        var q = data.queue.join("\n");

        // Get userinfo
        var users = [];
        Object.keys(data.userinfo).forEach(function(k) {
            users.push(k + ": " + data.userinfo[k].character + "(" + data.userinfo[k].online + ")");
        });
        var s2 = users.join("\n");


        alert(s1 + "\n-----\nQueue\n-----\n" + q + "\n-----\nUserInfo\n-----\n" + s2);
    });


    socketio.on("welcome", function(data){
        console.log("got welcome");
        console.log(data);
    });


    socketio.on("hello", function(data){
        console.log("got hello");
        console.log(data);
    });

    socketio.on("survey", function() {
        console.log("will go to survey");
        m.route.set("/survey");
    });

    this.socketio = socketio;
};

/*
 * Survey
 */

Socket.prototype.sendSurvey = function(data) {
    this.socketio.emit("survey", data);
};


/*
 * For Admin
 */

Socket.prototype.nextState = function() {
    this.socketio.emit("admin_nextstate");
};

Socket.prototype.getInfo = function() {
    this.socketio.emit("admin_get_info");
};

Socket.prototype.adminEval = function(cmd) {
    this.socketio.emit("admin_eval", cmd);
};

module.exports = Socket;
