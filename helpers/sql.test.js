const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate, sqlForFilteringCompany } = require("./sql");

/***************************** sqlForPartialUpdate */
describe("create SQL column names and values for update", function () {
    test("works with good data", function () {
        const dataToUpdate = { firstName: "joel", lastName: "schmole" };
        const jsToSql = { firstName: "first_name", lastName: "last_name" };
        const results = sqlForPartialUpdate(dataToUpdate, jsToSql);

        expect(results).toEqual({
            setCols: '\"first_name\"=$1, \"last_name\"=$2',
            values: ["joel", "schmole"]
        });
    });

    test("throws error with no data", function () {
        const dataToUpdate = {};
        const jsToSql = {};

        expect(() => sqlForPartialUpdate(dataToUpdate, jsToSql))
            .toThrow("No data");
    });
});

/***************************** sqlForFilteringCompany */
describe("create SQL for filtering companies WHERE clause", function () {
    test("works with good data in all fields", function () {
        const filterBy = { name: "c", minEmployees: 2, maxEmployees: 2 };
        const results = sqlForFilteringCompany(filterBy);

        expect(results)
            .toEqual("name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3 ");
    });

    test("works with good data in name only", function () {
        const filterBy = { name: "c" };
        const results = sqlForFilteringCompany(filterBy);

        expect(results)
            .toEqual("name ILIKE $1 ");
    });

    test("works with good data in minEmployees only", function () {
        const filterBy = { minEmployees: 2 };
        const results = sqlForFilteringCompany(filterBy);

        expect(results)
            .toEqual("num_employees >= $1 ");
    });

    test("works with good data in maxEmployees only", function () {
        const filterBy = { maxEmployees: 2 };
        const results = sqlForFilteringCompany(filterBy);

        expect(results)
            .toEqual("num_employees <= $1 ");
    });

    test("works with no data", function () {
        const filterBy = {};
        const results = sqlForFilteringCompany(filterBy);

        expect(results)
            .toEqual("");
    });

});