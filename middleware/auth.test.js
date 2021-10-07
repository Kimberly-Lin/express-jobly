"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureUserOrAdmin,
} = require("./auth");


const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");

/************************************** authenticateJWT */

describe("authenticateJWT", function () {
  test("works: via header", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    expect.assertions(2);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});

/************************************** ensureLoggedIn  */

describe("ensureLoggedIn", function () {
  test("works", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { username: "test" } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });
});

/************************************** ensureAdmin */

describe("ensureAdmin", function () {
  test("works", function () {

    // expect.assertions(1);
    const req = {};
    const res = { locals: { user: { isAdmin: true } } };
    const next = function (err) { //fake next function to make sure error is undefined
      expect(err).toBeFalsy();
    };
    ensureAdmin(req, res, next);
  });

  test("unauth if not admin", function () {
    const req = {};
    const res = { locals: { user: { isAdmin: false } } };
    expect(() => ensureAdmin(req, res)).toThrow();
  });
});

/************************************** ensureUserOrAdmin */

describe("ensureUserOrAdmin", function () {
  test("works for admin", function () {

    expect.assertions(1);
    const req = { params: { username: "test" } };
    const res = { locals: { user: { isAdmin: true, username: "any-admin" } } };
    console.log("res.locals.user.username is ", res.locals.user.username);
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureUserOrAdmin(req, res, next);
  });

  test("works for non-admin current user", function () {

    expect.assertions(1);
    const req = { params: { username: "test" } };
    const res = { locals: { user: { isAdmin: false, username: "test" } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureUserOrAdmin(req, res, next);
  });

  test("unauth if not admin and not the user", function () {
    expect.assertions(1);
    const req = { params: { username: "test" } };;
    const res = { locals: { user: { isAdmin: false, username: "wrong" } } };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureUserOrAdmin(req, res, next);
  });
});