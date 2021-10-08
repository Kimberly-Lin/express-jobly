"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
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
            expect(err).toBeTruthy();
        }
    });
});

/************************************** findAll */

describe("findAll", function () {
    test("works: no filter", async function () {
        const jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                id: j1id,
                title: "j1",
                salary: 10000,
                equity: "0.1",
                companyHandle: "c1",
            },
            {
                id: j2id,
                title: "j2",
                salary: 20000,
                equity: "0",
                companyHandle: "c1",
            },
            {
                id: j3id,
                title: "j3",
                salary: 30000,
                equity: "0.3",
                companyHandle: "c2",
            },
        ]);
    });
});

/************************************** findFiltered */

describe("findFiltered", function () {
    test("works", async function () {
        const results = await Job.findFiltered({
            title: "J",
            minSalary: 20000,
            hasEquity: true,
        });

        expect(results).toEqual([
            {
                id: j3id,
                title: "j3",
                salary: 30000,
                equity: "0.3",
                companyHandle: "c2",
            },
        ]);
    });

    test("no matching results", async function () {
        try {
            const results = await Job.findFiltered({
                title: "not-title",
                minSalary: 20000,
                hasEquity: true,
            });
            fail();
        } catch (err) {
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
            equity: "0.1",
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

/************************************** update */

describe("update", function () {
    const updateData = {
        title: "Updated Title",
        salary: 50,
        equity: "-1",
    };

    test("works", async function () {
        let job = await Job.update(j1id, updateData);
        expect(job).toEqual({
            id: j1id,
            ...updateData,
            companyHandle: "c1",
        });

        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle AS "companyHandle"
             FROM jobs
             WHERE id = ${j1id}`);
        expect(result.rows[0]).toEqual({
            id: j1id,
            title: "Updated Title",
            salary: 50,
            equity: "-1",
            companyHandle: "c1",
        });
    });
    // Why is this test necessary?
    test("works with null fields", async function () {
        const updateDataSetNulls = {
            title: "Updated Title",
            salary: null,
            equity: null,
        }

        let job = await Job.update(j1id, updateDataSetNulls);
        expect(job).toEqual({
            id: j1id,
            ...updateDataSetNulls,
            companyHandle: "c1",
        });

        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle AS "companyHandle"
               FROM jobs
               WHERE id = ${j1id}`);
        expect(result.rows[0]).toEqual({
            id: j1id,
            title: "Updated Title",
            salary: null,
            equity: null,
            companyHandle: "c1",
        });
    });

    test("works with partial fields", async function () {
        const updatePartialData = {
            title: "Updated Title",
        }

        let job = await Job.update(j1id, updatePartialData);
        expect(job).toEqual({
            id: j1id,
            ...updatePartialData,
            salary: 10000,
            equity: "0.1",
            companyHandle: "c1",
        });

        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle AS "companyHandle"
               FROM jobs
               WHERE id = ${j1id}`);
        expect(result.rows[0]).toEqual({
            id: j1id,
            title: "Updated Title",
            salary: 10000,
            equity: "0.1",
            companyHandle: "c1",
        });
    });

    test("not found if no such job", async function () {
        try {
            await Job.update(0, updateData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
            expect(err.message).toEqual("Job not found.");
        }
    });

    test("bad request with no data", async function () {
        try {
            await Job.update(j1id, {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** remove */

describe("remove", function () {
    test("works", async function () {
        await Job.remove(j1id);
        const response = await db.query(
            `SELECT id FROM jobs WHERE id = ${j1id}`
        );
        expect(response.rows.length).toEqual(0);
    });

    test("not found if no such job", async function () {
        try {
            await Job.remove(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
            expect(err.message).toEqual("Job not found.");
        };
    });
});

/***************************** _sqlForFiltering */
describe("create SQL for filtering jobs WHERE clause", function () {
    test("works with good data in all fields", function () {
        const filterBy = { title: "j", minSalary: 50, hasEquity: false };
        const results = Job._sqlForFiltering(filterBy);

        expect(results)
            .toEqual("title ILIKE $1 AND salary >= $2 ");
    });

    test("works with good data in title only", function () {
        const filterBy = { title: "j" };
        const results = Job._sqlForFiltering(filterBy);

        expect(results)
            .toEqual("title ILIKE $1 ");
    });

    test("works with good data in minSalary only", function () {
        const filterBy = { minSalary: 50 };
        const results = Job._sqlForFiltering(filterBy);

        expect(results)
            .toEqual("salary >= $1 ");
    });

    test("works with true equity filter only", function () {
        const filterBy = { hasEquity: true };
        const results = Job._sqlForFiltering(filterBy);

        expect(results).toEqual("equity > 0 ");
    })

    test("works with false equity filter only", function () {
        const filterBy = { hasEquity: false };
        const results = Job._sqlForFiltering(filterBy);

        expect(results)
            .toEqual("");
    });

    test("works with no data", function () {
        const filterBy = {};
        const results = Job._sqlForFiltering(filterBy);

        expect(results)
            .toEqual("");
    });
});