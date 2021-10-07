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
            throw new BadRequestError(`Company not found: ${companyHandle}`);
      
          const result = await db.query(
            `INSERT INTO jobs (
                title,
                salary, 
                equity, 
                company_handle)
                 VALUES
                   ($1, $2, $3, $4)
                 RETURNING id, title, salary, equity, company_handle AS 'companyHandle`,
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
}
// create
// findAll
// findFiltered
// get
// update
// remove
// sql for filtering helper function
