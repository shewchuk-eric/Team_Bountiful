// This is the main entry point of the application

const mongodb = require('./db/connect.js');
const express = require('express'); 
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const app = express();
const GitHubStrategy = require('passport-github2').Strategy;
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const port = process.env.PORT || 3000; 

require('dotenv').config(); 


app
  .use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  .use(cors())
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(session({
    secret: "secret",
    resave: false, 
    saveUninitialized: true
  }))
  .use(passport.initialize())
  .use(passport.session())
  .use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  })
  .use('/', require('./routes/index.js'));

passport.use(new GitHubStrategy({
    clientID:process.env.CLIENT_ID,
    clientSecret:process.env.CLIENT_SECRET,
    callbackURL:"http://localhost:3000/auth/github/callback" 
  }, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  })); 

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});


app.get("/", (req, res) => {
  if(req.user) {res.send('<a href="/api-docs/#/">You are logged in. View Swagger docs</a>')
  } else {
  res.send('<a href="/auth/github">Login with GitHub</a>');
}});

app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    req.session.isLoggedIn = true;
    req.session.username = req.user.username;
    res.redirect("/api-docs/#/");
  }
);

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});
  

mongodb.initDb((err, mongodb) => {
  if (err) {
    console.log(err);
  } else {
    app.listen(port);
    console.log(`Connected to DB and listening on ${port}`);
  }
});

module.exports = { app, passport };