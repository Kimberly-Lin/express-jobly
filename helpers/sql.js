"use strict";

const { BadRequestError } = require("../expressError");

/** Turn data object in JS into SQL compatible column names and values.
 * 
 * ({data}, {camelCase to snakeCase}) 
 * => {setCols: "fld1, fld2,...", values: [val1, val2,...]}
 * 
 * Throws BadRequestError if dataToUpdate is empty.
 * 
 * Example:
 * {firstName: "first", lastName: "last"}, 
 * {firstName: "first_name", lastName: "last_name"}
 * 
 * Returns: {
 * setCols: '\"first_name\"=$1, \"last_name\"=$2', 
 * values: ["first',"last"]}
 * 
 * */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
