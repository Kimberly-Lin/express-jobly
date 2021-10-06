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

/** Turns filterBy object into SQL WHERE compatible clause
 * 
 * {name, minEmployees, maxEmployees} 
 * => "name = $1 AND numEmployees > $2 AND numEmployees < $3"
 * 
 */
function sqlForFilteringCompany(filterBy) {
  let sqlWhere = "";
  let ind = 1;
  for (let field in filterBy) {
    if (field === "name") {
      sqlWhere += `name ILIKE $${ind} AND `;
      ind++;
    } else if (field === "minEmployees") {
      sqlWhere += `num_employees >= $${ind} AND `
      ind++;
    } else {
      sqlWhere += `num_employees <= $${ind} AND `
      ind++;
    }
  }

  sqlWhere = sqlWhere.slice(0, sqlWhere.length - 4);
  return sqlWhere;
}

module.exports = {
  sqlForPartialUpdate,
  sqlForFilteringCompany
};
