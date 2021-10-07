"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForFilteringCompany } = require("../helpers/sql");

/** Related functions for jobs. */

console.log("hello")