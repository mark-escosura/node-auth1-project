// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!
const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../users/users-model.js");
const {
  checkUsernameFree,
  checkUsernameExists,
  checkPasswordLength,
} = require("./auth-middleware.js");

router.post("/register", [checkUsernameFree, checkPasswordLength], (req, res, next) => {
  const { username, password } = req.body
  const hash = bcrypt.hashSync(password, 8)
  
  User.add({ username, password: hash})
  .then(users => {
    res.status(201).json(users)
  })
  .catch(next)
})
/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */

router.post("/login", checkUsernameExists, async (req, res, next) => {
  try {
    const { password } = req.body;
    if (bcrypt.compareSync(password, req.user.password)) {
      req.session.user = req.user;
      next({ message: `Welcome back ${req.user.username}` });
    } else {
      next({ status: 401, message: "Invalid Credentials" });
    }
  } catch (err) {
    next(err);
  }
});
/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */
router.get("/logout", (req, res, next) => {
  if (req.session.user) {
    res.session.destroy(err => {
      if(err) {
        next()
      } else {
        res.json({ message: "logged out"})
      }
    })
  } else {
    res.json({ message: "no session"})
  }
})
/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */

// Don't forget to add the router to the `exports` object so it can be required in other modules
module.exports = router;
