require("./style.scss");
var Socket = require("./socket.js");
var Util = require("./util.js");


window.DEBUG = true;

window.HOST = "http://smash:8080";



window.localStorage.clear();



// global hack for laziness
window.socket = new Socket(window.HOST);



// // No sleep hack?
// var noSleep = new NoSleep();
// function enableNoSleep() {
//     alert("enable nosleep");
//   noSleep.enable();
//   document.removeEventListener('click', enableNoSleep, false);
// }
// // Enable wake lock.
// // (must be wrapped in a user input event handler e.g. a mouse or touch handler)
// document.addEventListener('click', enableNoSleep, false);


/*
 * Views
 */

var Controller = require("./controller.js");
var Login = require("./login.js");
var Admin = require("./admin.js");
var Survey = require("./survey.js");




function start() {
    console.log("start");
    Util.vibrate(25);
    m.route(document.getElementById("main"), "/login", {
        "/login": Login,
        "/controller": Controller,
        "/admin4259": Admin,
        "/survey": Survey
    });
}

// Cordova
document.addEventListener("deviceready", function() {
    start();
});


document.addEventListener("DOMContentLoaded", function(){
    if (!window._cordovaNative) {
        start();
    }
});

window.addEventListener("orientationchange", function(){
    window.setTimeout(function(){
        m.redraw();
    }, 500);
});


window.oncontextmenu = function(event) {
     event.preventDefault();
     event.stopPropagation();
     return false;
};


