const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const Store = require("connect-session-knex")(session);
const authRouter = require('./auth/auth-router.js')
const userRouter = require('./users/users-router.js');

/**
 Do what needs to be done to support sessions with the `express-session` package!
 To respect users' privacy, do NOT send them a cookie unless they log in.
 This is achieved by setting 'saveUninitialized' to false, and by not
 changing the `req.session` object unless the user authenticates.
 
 Users that do authenticate should have a session persisted on the server,
 and a cookie set on the client. The name of the cookie should be "chocolatechip".
 
 The session can be persisted in memory (would not be adecuate for production)
 or you can use a session store like `connect-session-knex`.
 */

const server = express();

server.use(session({
  name: 'chocolatechip',
  secret: process.env.SESSION_SECRET || 'keep it secret, keep it safe',
  cookie: {
    maxAge: 1000 * 60 * 60,
    secure: false, // secure true means, the session only works on https
    httpOnly: false // httpOnly true means the JavaScript cannot read cookie
  },
  resave: false, // not important
  saveUninitialized: false, // sessions false don't get stored on the server by default, we have to "cause it" to happen in the code GDPR
  rolling: true, // pushed back logout date ||  a fresh cookie will be set in the client
  store: new Store({
    knex: require('../data/db-config.js'),
    tablename: 'sessions',
    sidfieldname: 'sid',
    createtable: true,
    clearInterval: 1000 * 60 * 60,
  })
}))
server.use(helmet());
server.use(express.json());
server.use(cors());

server.use("/api/auth", authRouter)
server.use("/api/users", userRouter)

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

server.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  });
});

module.exports = server;
