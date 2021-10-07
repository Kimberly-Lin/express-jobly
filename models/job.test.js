"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    j1id,
    j2id,
    j3id,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */
describe("create", function () {
    test("works", async function () {
        const newJob = await Job.create({
            title: "Test",
            salary: 10000,
            equity: 0,
            companyHandle: "c1",
        });

        expect(newJob).toEqual({
            id: expect.any(Number),
            title: "Test",
            salary: 10000,
            equity: "0",
            companyHandle: "c1",
        });
    });

    test("bad request, non-existant company handle", async function () {
        try {
            const newJob = await Job.create({
                title: "Test",
                salary: 10000,
                equity: 0,
                companyHandle: "badHandle",
            });
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
            expect(err.message).toEqual("Company not found");
        };
    });

    test("doesn't work, missing data", async function () {
        try {
            const newJob = await Job.create({ // no title passed in
                salary: 10000,
                equity: 0,
                companyHandle: "c1",
            });
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** findAll */

describe("findAll", function () {
    test("works: no filter", async function () {
        const jobs = await Jobs.findAll();
        expect(jobs).toEqual([
            {
                id: j1id,
                title: "j1",
                salary: 10000,
                equity: 0.1,
                companyHandle: "c1",
            },
            {
                id: j2id,
                title: "j2",
                salary: 20000,
                equity: 0,
                companyHandle: "c1",
            },
            {
                id: j3id,
                title: "j3",
                salary: 30000,
                equity: 0.3,
                companyHandle: "c2",
            },
        ]);
    });
});

/************************************** findFiltered */

describe("findFiltered", function () {
    test("works", async function () {
        const results = await Company.findFiltered({
            title: "J",
            minSalary: 20000,
            hasEquity: true,
        });

        expect(results).toEqual([
            {
                id: j3id,
                title: "j3",
                salary: 30000,
                equity: 0.3,
                companyHandle: "c2",
            },
        ]);
    });

    test("no matching results", async function () {
        try {
            const results = await Company.findFiltered({
                title: "not-title",
                minSalary: 20000,
                hasEquity: true,
            });
            fail();
        } catch {
            expect(err instanceof NotFoundError).toBeTruthy();
            expect(err.message).toEqual("No jobs matching your filters are found.")
        }
    });
});

/************************************** get */

describe("get", function () {

    test("works", async function () {
        let job = await Job.get(j1id);
        expect(job).toEqual({
            id: expect.any(Number),
            title: "j1",
            salary: 10000,
            equity: 0.1,
            companyHandle: "c1",
        });
    });

    test("not found if no such job", async function () {
        try {
            await Job.get(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
            expect(err.message).toEqual("Job is not found.")
        }
    });
});