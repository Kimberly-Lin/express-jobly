"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  admin1Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /companies */

describe("POST /jobs", function () {
  const newJob = {
    title: "new",
    salary: 50,
    equity: 0.5,
    companyHandle: "c3"
  };

  test("ok for admins", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: newJob,
    });
  });

  test("unauth for reg users", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with company that does not exist", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new",
        salary: 10,
        equity: 0.1,
        companyHandle: "not-a-company"
      })
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        //no title
        salary: 10,
        equity: 0.1,
        companyHandle: "c1"
      })
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: 61,
        salary: 6234.5,
        equity: 1.5,
        companyHandle: 5312,
      })
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});


/************************************** GET /jobs */

describe("GET /jobs", function () {

  test("ok for logged in users", async function () {
    const resp = await request(app)
      .get("/jobs")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      jobs:
        [
          {
            title: "j1",
            salary: 10000,
            equity: 0.1,
            companyHandle: "c1",
          },
          {
            title: "j2",
            salary: 20000,
            equity: 0,
            companyHandle: "c1",
          },
          {
            title: "j3",
            salary: 30000,
            equity: 0.3,
            companyHandle: "c2",
          },
        ],
    });
  });

  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
        [
          {
            title: "j1",
            salary: 10000,
            equity: 0.1,
            companyHandle: "c1",
          },
          {
            title: "j2",
            salary: 20000,
            equity: 0,
            companyHandle: "c1",
          },
          {
            title: "j3",
            salary: 30000,
            equity: 0.3,
            companyHandle: "c2",
          },
        ],
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
      .get("/jobs")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });

  test("filtering works", async function () {
    const resp = await request(app).get(`/jobs?title=j&minSalary=20000&hasEquity=true`);
    expect(resp.body).toEqual({
      jobs:
        [{
          title: "j3",
          salary: 30000,
          equity: 0.3,
          companyHandle: "c2",
        }]
    });
  });

  test("fails: filtering bad queries", async function () {
    const resp = await request(app).get(`/jobs?bonuses=yes`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for logged in users", async function () {
    const resp = await request(app)
      .get(`/jobs/j1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      job: {
        id: j1id,
        title: "j1",
        salary: 10000,
        equity: 0.1,
        companyHandle: "c1",
      },
    });
  });

  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/c1`);
    expect(resp.body).toEqual({
      job: {
        id: j1id,
        title: "j1",
        salary: 10000,
        equity: 0.1,
        companyHandle: "c1",
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /companies/:handle */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/j1`)
      .send({
        title: "j1-new",
      })
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.body).toEqual({
      company: {
        title: "j1-new",
        salary: 10000,
        equity: 0.1,
        companyHandle: "c1",
      },
    });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
      .patch(`/jobs/j1`)
      .send({
        title: "j1-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401)
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .patch(`/jobs/j1`)
      .send({
        title: "j1-new",
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
      .patch(`/jobs/0`)
      .send({
        title: "new nope",
      })
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const resp = await request(app)
      .patch(`/jobs/j1`)
      .send({
        id: 7,
      })
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on company change attempt", async function () {
    const resp = await request(app)
      .patch(`/jobs/j1`)
      .send({
        companyHandle: "not-a-company",
      })
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/j1`)
      .send({
        title: 58132,
      })
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .delete(`/jobs/j1`)
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.body).toEqual({ deleted: "j1" });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
      .delete(`/jobs/j1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .delete(`/jobs/j1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
      .delete(`/jobs/nope`)
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
