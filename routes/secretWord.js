const express = require("express");
const csrf = require('host-csrf');
const router = express.Router();
const csrf_middleware = csrf();

router.use(csrf_middleware);

router.get("/", (req, res) => {
    if(!req.session.secretWord) {
        req.session.secretWord = "syzygy";
    }
    
    res.render("secretWord", { secretWord: req.session.secretWord });
});

router.post("/", (req, res) => {
    if (req.body.secretWord.toUpperCase()[0] == "P") {
        req.flash("error", "That word won't work!");
        req.flash("error", "You can't use words that start with p.");
    } else {
        req.session.secretWord = req.body.secretWord;
        req.flash("info", "The secret word was changed.");
    }

    res.redirect("/secretWord");
    });
 
router.get("/get_token", (req, res) => {
    const csrfToken = csrf.token();
    res.json({ csrfToken });
});

//this was breaking my code........whyyy????
// const csrfToken = csrf.token();
// res.render("secretWord", {
//     secretWord: req.session.secretWord,
//     csrfToken: csrfToken
// });

module.exports = router;