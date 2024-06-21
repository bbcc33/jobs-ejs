require("dotenv").config(); // to load the .env file into the process.env object

const express = require("express");
const app = express();
const csrf = require("host-csrf");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit")
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const bodyParser = require("body-parser")
require("express-async-errors");

app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true}))
app.use(helmet());
app.use(xss());

//rate limiting prevents abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 min
  max: 100 //limits each IP to 100 requests per windowMs
});
app.use(limiter);

//ensure 'url' is defined before using it
const url = process.env.MONGO_URI;
const store = new MongoDBStore({
  // may throw an error, which won't be caught
  uri: url,
  collection: "mySessions",
});
store.on("error", function (error) {
  console.log(error);
});

const sessionParams = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionParams.cookie.secure = true; // serve secure cookies
}
app.use(session(sessionParams))

//CSRF setup
let csrf_development_mode = true;
if (app.get("env") === "production") {
  csrf_development_mode = false;
  app.set("trust proxy", 1);
}

const csrf_options = {
  protected_operation: ["PATCH"],
  protected_content_types: ["application/json"],
  // development_mode: app.get("env") === "development",
  development_mode: csrf_development_mode,
};

const csrf_middleware = csrf(csrf_options); //initialise and return middleware
app.use(csrf_middleware)
// Generate CSRF token and add it to locals

app.use((req, res, next) => {
  console.log("Generated CSRF Token: ", req.cookies["csrf-token"]);
  next();
})

//this must come after the above app.use because flash depends on session
app.use(require("connect-flash")());

app.use(require("./middleware/storeLocals"));

app.use((req, res, next) => {
  res.locals.__Host_csrfToken = csrf.token(req, res);
  next();
});

//passport initialization
const passport = require("passport");
const passportInit = require("./passport/passportInit");
passportInit();
app.use(passport.initialize());
app.use(passport.session());

//set view engine
app.set("view engine", "ejs");
app.set("views", "views");
//parse URL-encoded bodies

app.use((req,res,next)=> {
  if (req.path == "/multiply") {
    res.set("Content-Type","application/json")
  } else {
    res.set("Content-Type","text/html")
  }
  next()
})


//routes
const jobs = require("./routes/jobs")
const auth = require("./middleware/auth")
app.use("/jobs", auth, jobs);

app.get("/", (req, res) => {
  res.render("index");
});
app.use("/sessions", require("./routes/sessionRoutes"));

app.get("/multiply", (req,res)=> {
  // const first = parseFloat(req.query.first);
  // const second = parseFloar(req.query.second);
  // let result = first * second;
  
  const result = req.query.first * req.query.second
  if (result.isNaN) {
    result = "NaN"
  } else if (result == null) {
    result = "null"
  }
  res.json({result: result})
})


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

// const start = async () => {
//   try {
// let mongoURL = process.env.MONGO_URI
// if (process.env.NODE_ENV == "test") {
// mongoURL = process.env.MONGO_URI_TEST
// }
// await require("./db/connect")(mongoURL);
//   app.listen(port, () =>
//       console.log(`Server is listening on port ${port} ... `)
//   );
// } catch (error) {
//   console.log(error);
// }
// }

const start = () => {
    try {
      require("./db/connect")(url);
      return app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`),
    );
  } catch (error) {
    console.log(error);
  }
};

const server = start();

module.exports = { app, server }; 

// start();