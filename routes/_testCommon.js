// "use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const Job = require("../models/job");
const { createToken } = require("../helpers/tokens");

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM jobs");

  await Company.create(
    {
      handle: "c1",
      name: "C1",
      numEmployees: 1,
      description: "Desc1",
      logoUrl: "http://c1.img",
    });
  await Company.create(
    {
      handle: "c2",
      name: "C2",
      numEmployees: 2,
      description: "Desc2",
      logoUrl: "http://c2.img",
    });
  await Company.create(
    {
      handle: "c3",
      name: "C3",
      numEmployees: 3,
      description: "Desc3",
      logoUrl: "http://c3.img",
    });

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });
  await User.register({
    username: "admin1",
    firstName: "AdminFirst1",
    lastName: "AdminLast1",
    email: "admin@user.com",
    password: "password4",
    isAdmin: true,
  });

  await Job.create({
    title: "j1",
    salary: 10000,
    equity: 0.1,
    companyHandle: "c1",
  });
  await Job.create({
    title: "j2",
    salary: 20000,
    equity: 0,
    companyHandle: "c1",
  });
  await Job.create({
    title: "j3",
    salary: 30000,
    equity: 0.3,
    companyHandle: "c2",
  });

  const result = await db.query(`SELECT id FROM jobs ORDER BY title`);

  const jobIds = result.rows.map(job => job.id);

  [j1id, j2id, j3id ] = jobIds;
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


const u1Token = createToken({ username: "u1", isAdmin: false });
const admin1Token = createToken({ username: "admin1", isAdmin: true });


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  admin1Token,
};
