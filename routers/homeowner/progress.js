const express = require('express');
const passport = require('passport');
const router = express.Router();

const { runPreparedQuery } = require('../../database');
const { getPRJOA } = require('../../queries/homeowner/progress');
const { isNumOnly } = require('../../utils/validation');

router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let flag = true;
    let message = [];
    let { id } = req.query;
    if (!isNumOnly(id)) {
        flag = false;
        message.push("Invalid ID detected, please try again.");
    }

    if (flag) {
        try {
            let resGetPRJOA = await runPreparedQuery(getPRJOA, { id });
            res.status(200).json(
            { 
                flag: true, 
                activities: resGetPRJOA.recordset
            });
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    } else {
        res.status(200).json({ flag, message });
    }
});

module.exports = router;