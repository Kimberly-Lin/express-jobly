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

    test("bad request, non-existant company handle", async function(){
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

    test("doesn't work, missing data", async function() {
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
