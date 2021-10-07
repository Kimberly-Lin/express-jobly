"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForFilteringCompany } = require("../helpers/sql");


/** Related functions for jobs. */


class Job {
  /** Create a job (from data), update db, return new job data.
 *
 * data should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Throws BadRequestError if job already in database.
 * */
  static async create({ title, salary, equity, companyHandle }) {
    const checkValidCompany = await db.query(
      `SELECT handle
                 FROM companies
                 WHERE handle = $1`,
      [companyHandle]);

    if (!checkValidCompany.rows[0])
      throw new BadRequestError("Company not found");

    const result = await db.query(
      `INSERT INTO jobs (
                title,
                salary, 
                equity, 
                company_handle)
                 VALUES
                   ($1, $2, $3, $4)
                 RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [
        title,
        salary,
        equity,
        companyHandle,
      ],
    );
    const job = result.rows[0];

    return job;
  }
  /** Find all jobs.
     *
     * Returns [{ id, title, salary, equity, companyHandle }, ...]
     * */

  static async findAll() {
    const jobsRes = await db.query(
      `SELECT id,
                title,
                salary,
                equity,
                company_handle AS "companyHandle"
           FROM jobs
           ORDER BY id`);
    return jobsRes.rows;
  };

  /** Given filter criteria, returns data about matching jobs. 
  * 
  * Returns [{ id, title, salary, equity, companyHandle }, ...]
  * 
  * Throws a NotFoundError if there are no matching jobs.
  */

  static async findFiltered(filter) {

    filter.title = `%${filter.title}%`;
    let values = Object.values(filter);
    const sqlWhere = Job._sqlForFiltering(filter);

    //pop out true/false from values array if filterBy includes hasEquity
    if (filter.hasEquity) {
      values.pop();
    }

    const result = await db.query(`SELECT id,
                                       title,
                                       salary,
                                       equity,
                                       company_handle AS "companyHandle"
                                FROM jobs
                                WHERE ${sqlWhere}
                                ORDER BY id`, values);

    const filteredJobs = result.rows;
    if (!filteredJobs[0]) {
      throw new NotFoundError("No jobs matching your filters are found.")
    };
    return filteredJobs;
  };

  /** Turns filterBy object into SQL WHERE compatible clause
  * 
  * {title, minSalary, hasEquity: true} 
  * => "title ILIKE $1 AND salary >= $2 AND equity > 0 "
  * 
  */
  static _sqlForFiltering(filterBy) {
    let sqlWhere = "";
    let ind = 1;
    for (let field in filterBy) {
      if (field === "title") {
        sqlWhere += `title ILIKE $${ind} AND `;
        ind++;
      } else if (field === "minSalary") {
        sqlWhere += `salary >= $${ind} AND `
        ind++;
      } else if (field === "hasEquity") {
        if (filterBy[field]) {
          sqlWhere += `equity > 0 AND `
          ind++;
        }
      }
    }
    sqlWhere = sqlWhere.slice(0, sqlWhere.length - "AND ".length);
    return sqlWhere;
  }

}


module.exports = Job;

// findFiltered
// get
// update
// remove

