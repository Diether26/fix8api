const express = require('express');
const passport = require('passport');
const { fetchQuery, } = require('../../database');
const { getReportUsers, getUserLogs } = require('../../queries/admin/report');
const router = express.Router();

router.get('/reported-users', passport.authenticate('jwt', {session: false}), fetchQuery(getReportUsers));
router.get('/user-logs', passport.authenticate('jwt', {session: false}), fetchQuery(getUserLogs));


module.exports = router;