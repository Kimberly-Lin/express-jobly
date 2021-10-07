const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate, sqlForFilteringCompany } = require("./sql");

/***************************** sqlForPartialUpdate */
describe("create SQL column names and values for update", function () {
    test("works with good data", function () {
        const dataToUpdate = { firstName: "joel", lastName: "schmole" };
        const jsToSql = { firstName: "first_name", lastName: "last_name" };
        const results = sqlForPartialUpdate(dataToUpdate, jsToSql);

        expect(results).toEqual({
            setCols: '"first_name"=$1, "last_name"=$2',
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