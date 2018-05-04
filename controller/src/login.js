var Login = {};

window.loginIsLoading = false;

var CHARACTERS = [
    "Dr. Mario",
    "Mario",
    "Luigi",
    "Bowser",
    "Peach",
    "Yoshi",
    "DK",
    "C.Falcon",
    "Ganondorf",
    "Falco",
    "Fox",
    "Ness",
    "Ice Climbers",
    "Kirby",
    "Samus",
    "Zelda",
    "Link",
    "Young Link",
    "Pichu",
    "Pikachu",
    "Jigglypuff",
    "Mewtwo",
    "Mr.Game & Watch",
    "Marth",
    "Roy",
];

Login.selectedSpriteIndex = 0;
Login.oninit = function() {
    Login.selectedSpriteIndex = Math.floor(Math.random() * CHARACTERS.length);
};


Login.spriteToIndex = function(r, c) {
    var index = 9*r + c;

    return index;
};

Login.login = function() {
    var username = document.getElementById("username").value;

    // Test for alphanumeric
    var r = /^[a-z0-9]+$/i;

    // Check if username valid
    if (username.length === 0 || username.length > 8 || !r.test(username)) {
        alert("Your username must only contain letters and numbers, and not exceed 8 characters");
    }
    else {
        // Make uppercase
        username = username.toUpperCase();

        var character = CHARACTERS[Login.selectedSpriteIndex];

        window.socket.login(username, character);
        window.loginIsLoading = true;
    }
};

Login.genSprites = function() {
    function _gen_onclick(index) {
        return function() {
            Login.selectedSpriteIndex = index;
        };
    }


    var filename;
    var arr = [];
    for (var r = 0; r < 3; r++) {
        var row = [];
        for (var c = 0; c < 9; c++) {
            var index = Login.spriteToIndex(r, c);

            if (r === 2 && c >= 7) {
                // Add start button and break
                row.push(m("img", {
                    src: "/images/sprites/start.png",
                    style: { width: "22%" },
                    onclick: Login.login
                }));
                break;
            }

            filename = r + "_" + c + ".png";
            row.push(m("img", {
                src: "/images/sprites/" + filename,
                class: index === Login.selectedSpriteIndex? "selected" : "",
                style: {
                    width: "11%"
                },
                onclick: _gen_onclick(index),
            }));
        }

        arr.push(m("div", row));
    }


    return arr;
};


Login.view = function() {
    return m("div#login", [
        m("h2", "Choose your character and username!"),
        m("div.sprites",
            Login.genSprites()
        ),
        m("div",
            m("input[type='text'][id='username']",
                {
                    placeholder: "Enter your username (letters and numbers only, 8 characters max)",
                    style: {
                        width: "100%",
                        height: "2em"
                    }
                }
            )
        ),

        !window.loginIsLoading? "" : [
            m("div.loader")
        ],
        // m("button", {onclick: Login.login}, "Enter")
    ]);
};


module.exports = Login;
