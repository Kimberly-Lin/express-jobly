"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobFilter = require("../schemas/jobFilter.json");

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, comapnyHandle }
 *
 * Returns { id, title, salary, equity, comapnyHandle }
 *
 * Authorization required: login, admin only
 */

 router.post("/", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
  
    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  });

/** GET /  =>
 *   { jobs: [ { id, title, salary, equity, comapnyHandle }, ...] }
 *
 * Can filter on provided search filters:
 * - title (will find case-insensitive, partial matches)
 * - minSalary
 * - hasEquity 
 *
 * Authorization required: none
 */

 router.get("/", async function (req, res, next) {

    const filterBy = req.query;
  
    for (let key in filterBy) {
      if (key === "minSalary") {
        filterBy[key] = Number(filterBy[key]);
      } else if (key === "hasEquity") {
          if (filterBy[key] === "true") {
            filterBy[key] = true;
          } else if (filterBy[key] === "false") {
            filterBy[key] = false;
          }
      }
    }
  
    const result = jsonschema.validate(filterBy, jobFilter);
    if (!result.valid) {
      let errs = result.errors.map(err => err.stack);
      throw new BadRequestError(errs);
    }
  
    const jobs = (Object.keys(filterBy).length === 0) 
        ? await Job.findAll() 
        : await Job.findFiltered(filterBy);
  
    return res.json({ jobs });
  });

/** GET /[id]  =>  { job }
 *
 *  job is { id, title, salary, equity, comapnyHandle }
 *
 * Authorization required: none
 */

 router.get("/:id", async function (req, res, next) {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  });

  /** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, comapnyHandle }
 *
 * Authorization required: login, admin only
 */

router.patch("/:id", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
  
    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  });

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: login, admin only
 */

 router.delete("/:id", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  });

  module.exports = router;