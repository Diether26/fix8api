const express = require('express');
const passport = require('passport');
const router = express.Router();

const { runPreparedQuery, connect, begin, rollback, disconnect, runPreparedQueryTSQL, commit } = require('../../database');
const { getJobOrderById } = require('../../queries/electrician/joborder');
const { insertProgressReport, getPRJOA } = require('../../queries/electrician/progress');
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

router.post('/submit', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let flag = true;
    let message = [];
    let { id, remarks } = req.body;
    if (!isNumOnly(id)) {
        flag = false;
        message.push("Invalid ID detected, please try again.");
    }
    if (!remarks) {
        flag = false;
        message.push("Please add remarks before submitting this report.");
    }
    if (remarks && remarks.length > 500) {
        flag = false;
        message.push("Remarks must not exceed to 500 characters in length.");
    }

    if (flag) {
        try {
            await connect();
            await begin();
            let resGetJobOrder = await runPreparedQuery(getJobOrderById, { id, uid: req.user.Id });
            if (resGetJobOrder.recordset.length > 0) {
                let data = resGetJobOrder.recordset[0];
                if (data.latest_activity_status === "In Progress") {
                    let resCreateProgressReport = await runPreparedQueryTSQL(insertProgressReport, 
                                            {  
                                                id,
                                                remarks                      
                                            }
                                        );
                    if (resCreateProgressReport.rowsAffected > 0) {
                        await commit();
                        await disconnect();
                        res.status(200).json({ flag: true, message: [ `You have successfully added progress report.` ] });
                    } else {
                        await rollback();
                        await disconnect();
                        res.status(200).json({ flag: false, message: [ `Failed to add progress report. Please try again.` ] });
                    }
                } else {
                    res.status(200).json({ flag: false, message: [ `It seems like the job order selected is not in 'IN PROGRESS' status. Please try again.` ] });
                }
            } else {
                res.status(200).json({ flag: false, message: [ `Unable to find job order.` ] });
            }
        } catch (error) {
            console.log(error);
            await rollback();
            await disconnect();
            res.sendStatus(500);
        }
    } else {
        res.status(200).json({ flag, message });
    }
})

module.exports = router;