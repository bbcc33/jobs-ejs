const express = require("express");
const passport = require("passport");
const csrf = require("host-csrf");
const router = express.Router();
const csrf_middleware = csrf();

router.use(csrf_middleware);

const {
    logonShow,
    registerShow,
    registerDo,
    logoff,
} = require("../controllers/sessionController");

router.route("/register").get(registerShow).post(registerDo);
router
    .route("/logon")
    .get(logonShow)
    .post(
        passport.authenticate("local", {
        successRedirect: "/secretWord",
        failureRedirect: "/sessions/logon",
        failureFlash: true,
        }),
        (req, res) => {
            //documentation says its good practice to refresh the token as the user logs on
            csrf.refresh(req,res);
        }
        );
    router.route("/logoff").post(logoff);

    module.exports = router;