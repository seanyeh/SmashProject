var Survey = {};

// <fieldset>
//                 <legend>What is Your Favorite Pet?</legend>
//                         <input type="checkbox" name="animal" value="Cat" />Cats <br />
//                         <input type="checkbox" name="animal" value="Dog" />Dogs<br />
//                         <input type="checkbox" name="animal" value="Bird" />Birds<br />
//                         <input type="submit" value="Submit now" />
//         </fieldset>

Survey.view = function() {
    return m("div.survey", [

        m("h2", "Thanks for participating in Smash, the multimedia experience!"),

        m("br"),
        m("img[src='congrats.jpg'][width='100%']"),
        m("br"),



        m("p", "If you have a minute, please help us out by filling out this survey!"),
        m("p", {style: {"font-style": "italic"}}, "All questions are optional"),


        m("fieldset", [
            m("legend", "How much did you enjoy the experience? (1=didn't enjoy, 5=enjoyed a lot)"),
            m("label", "1"),
            m("input[type='radio'][name='enjoy'][value='1']"),
            m("input[type='radio'][name='enjoy'][value='2']"),
            m("input[type='radio'][name='enjoy'][value='3']"),
            m("input[type='radio'][name='enjoy'][value='4']"),
            m("input[type='radio'][name='enjoy'][value='5']"),
            m("label", "5"),
        ]),

        m("fieldset", [
            m("legend", "Would you be interested in attending another event like this?"),
            m("label", m("input[type='checkbox'][name='interest'][value='no']"), "Not really :("),
            m("br"),
            m("label", m("input[type='checkbox'][name='interest'][value='smash']"), "Yes, for Smash Bros"),
            m("br"),
            m("label", m("input[type='checkbox'][name='interest'][value='other']"), "Yes, for other games"),
        ]),

        m("fieldset", [
            m("legend", "Any comments? (what did you like, what could be improved, etc.)"),
            m("textarea[rows=10][id='comments']", {style: "width: 100%;"})
        ]),

        m("fieldset", [
            m("legend", "Enter your email if you'd like to hear about future events"),
            m("input[type='email'][id='email']", {style: "width: 100%;"})
        ]),


        m("a", {
            onclick: function() {
                if (window.confirm("Are you sure you want to submit?")) {
                    var enjoy = document.querySelector("input[name='enjoy']:checked");
                    var interest = document.querySelectorAll("input[name='interest']:checked");
                    var comments = document.getElementById("comments");
                    var email = document.getElementById("email");

                    var enjoyStr = "enjoy:";
                    if (enjoy) {
                        enjoyStr += enjoy.value;
                    }

                    var interestStr = "interest:";
                    interest.forEach(function(e) {
                        interestStr += "," + e.value;
                    });

                    var commentsStr = "comments:" + comments.value;
                    var emailStr = "email:" + email.value;

                    var total = enjoyStr + "\n" + interestStr + "\n" + commentsStr + "\n" + emailStr + "\n";

                    window.socket.sendSurvey(total);

                    alert("Thank you so much!");
                    m.route.set("/login");



                }
            }
        }, "Submit!"),


    ]);
};

module.exports = Survey;
