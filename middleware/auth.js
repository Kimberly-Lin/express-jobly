"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

// better to make success the if statement, and the else is the error
function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError("You must be logged in");
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must be admin.
 *
 * If not, raises Unauthorized.
 */

function ensureAdmin(req, res, next) {
  if (!res.locals.user.isAdmin) {
    throw new UnauthorizedError("You must be an admin");
  }
  return next();
}

/** Middleware to use when they must be user specified in url or admin.
 *
 * If not, raises Unauthorized.
 */

//TODO: can get rid of try catch, write if condition for success, else for error (better for screening bugs)
function ensureUserOrAdmin(req, res, next) {
  try {
    if (req.params.username !== res.locals.user.username
      && res.locals.user.isAdmin === false) {
      throw new UnauthorizedError("You must be the user or an admin");
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureUserOrAdmin,
};
