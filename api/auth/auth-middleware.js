const User = require("../users/users-model.js");

/*
  If the user does not have a session saved in the server

  status 401
  {
    "message": "You shall not pass!"
  }
*/
function restricted(req, res, next) {
  // 1- it checked response for a COOKIE header
  // 2- pulled session id from it
  // 3- checked if live session by that id
  if (req.session.user) {
    next();
  } else {
    next({ status: 401, message: "You shall not pass!" });
  }
}

/*
  If the username in req.body already exists in the database

  status 422
  {
    "message": "Username taken"
  }
*/
async function checkUsernameFree(req, res, next) {
  const username = { username: req.body.username };
  try {
    const users = await User.findBy(username);
    if (users.length === 0) {
      next();
    } else {
      next({ status: 422, message: "Username taken" });
    }
  } catch (err) {
    next(err);
  }
}

/*
  If the username in req.body does NOT exist in the database

  status 401
  {
    "message": "Invalid credentials"
  }
*/
async function checkUsernameExists(req, res, next) {
  try {
    const users = await User.findBy({ username: req.body.username });
    if (users.length) {
      req.user = users[0]
      next()
    } else {
      next({ status: 401, message: "Invalid credentials" });
    }
  } catch (err) {
    next(err);
  }
}
/*
  If password is missing from req.body, or if it's 3 chars or shorter

  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
*/
function checkPasswordLength(req, res, next) {
  if (!req.body.password || req.body.password.length < 3) {
    next({ status: 422, message: "Password must be longer than 3 chars" });
  } else {
    next();
  }
}

// Don't forget to add these to the `exports` object so they can be required in other modules
module.exports = {
  restricted,
  checkUsernameFree,
  checkUsernameExists,
  checkPasswordLength,
};
