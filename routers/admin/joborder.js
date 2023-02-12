const express = require('express');
const formidable = require('formidable');
const fs = require('fs');
const passport = require('passport');
const { fetchQuery } = require('../../database');
const { getJoborders } = require('../../queries/admin/joborder');

const router = express.Router();

router.get('/', passport.authenticate('jwt',{ session: false}), fetchQuery(getJoborders));

module.exports = router;