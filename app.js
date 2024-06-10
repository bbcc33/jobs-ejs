const express = require("express");
require("express-async-errors");
const cookieParser = require("cookie-parser");
const csrf = require("host-csrf");
require("dotenv").config(); // to load the .env file into the process.env object

const app = express();

//CSRF setup
let csrf_development_mode = true;
if (app.get("env") === "production") {
  csrf_development_mode = false;
  app.set("trust proxy", 1);
}

const csrf_options = {
  protected_operation: ["PATCH"],
  protected_content_types: ["application/json"],
  development_mode: csrf_development_mode,
};

const csrf_middleware = csrf(csrf_options); //initialise and return middleware

// Generate CSRF token and add it to locals
app.use((req, res, next) => {
  console.log("request object properties: ". Object.keys(req));
    console.log("Cookies: ", req.cookies);
    console.log("Signed Cookies: ", req.signedCookies);
  res.locals.csrfToken = csrf.token(req, res);
  next();
});

app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.urlencoded({ extended: false }));

//must be used before the routes it protects
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false, 
        saveUninitialized: true,
    })
);

app.use(csrf_middleware);

const url = process.env.MONGO_URI;

const store = new MongoDBStore({
  // may throw an error, which won't be caught
  uri: url,
  collection: "mySessions",
});
store.on("error", function (error) {
  console.log(error);
});

// const sessionParams = {
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: true,
//   store: store,
//   cookie: { secure: false, sameSite: "strict" },
// };

// if (app.get("env") === "production") {
//   app.set("trust proxy", 1); // trust first proxy
//   sessionParams.cookie.secure = true; // serve secure cookies
// }

// app.use(session(sessionParams));

//this must come after the above app.use because flash depends on session
app.use(require("connect-flash")());

//passport initialization
const passport = require("passport");
const passportInit = require("./passport/passportInit");
passportInit();
app.use(passport.initialize());
app.use(passport.session());

//set view engine
app.set("view engine", "ejs");
//parse URL-encoded bodies
app.use(require("body-parser").urlencoded({ extended: true }));

// app.use(
//     session({
//         secret: process.env.SESSION_SECRET,
//         resave: false, 
//         saveUninitialized: true,
//     })
// );

app.use(require("./middleware/storeLocals"));
app.get("/", (req, res) => {
  res.render("index");
});
app.use("/sessions", require("./routes/sessionRoutes"));

//secret word handling
// let secretWord = "syzygy";

// app.get("/secretWord", (req, res) => {
//     if (!req.session.secretWord) {
//       req.session.secretWord = "syzygy";
//     }
//     res.locals.info = req.flash("info");
//     res.locals.errors = req.flash("error");
//     res.render("secretWord", { secretWord: req.session.secretWord });
//   });

// app.post("/secretWord", (req, res) => {
//     req.session.secretWord = req.body.secretWord;
//     secretWord = req.body.secretWord;
//     res.redirect("/secretWord");
// });

// app.post("/secretWord", (req, res) => {
//     if (req.body.secretWord.toUpperCase()[0] == "P") {
//       req.flash("error", "That word won't work!");
//       req.flash("error", "You can't use words that start with p.");
//     } else {
//       req.session.secretWord = req.body.secretWord;
//       req.flash("info", "The secret word was changed.");
//     }
//     res.redirect("/secretWord");
//   });

const auth = require("./middleware/auth");
const secretWordRouter =  require("./routes/secretWord");
app.use("/secretWord", auth, secretWordRouter);

app.use((req, res) => {
    res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
    res.status(500).send(err.message);
    console.log(err);
});


const port = process.env.PORT || 3000;

const start = async () => {
    try {
      //make sure the two lines below here actually belong here
      await require("./db/connect")
      (process.env.MONGO_URI);
        app.listen(port, () =>
            console.log(`Server is listening on port ${port} ... `)
        );
    } catch (error) {
        console.log(error);
    }
};

start();