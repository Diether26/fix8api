const express = require('express');
const passport = require('passport');
const router = express.Router();

const { isNumOnly } = require('../../utils/validation');
const { runPreparedQueryTSQL, connect, begin, commit, disconnect, rollback, runPreparedQuery } = require('../../database');
const { getJobOrderById } = require('../../queries/homeowner/joborder');
const { insertFeedback, getFeedbackByJobId } = require('../../queries/homeowner/feedback');

router.post('/submit', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let flag = true;
    let message = [];
    let { id, rate, comment } = req.body;
    if (!isNumOnly(id)) {
        flag = false;
        message.push("Invalid ID detected, please try again.");
    }
    if (!isNumOnly(rate)) {
        flag = false;
        message.push("Please select valid rating.");
    }
    if (isNumOnly(rate) && (rate < 1 || rate > 5)) {
        flag = false;
        message.push("Please select valid rating.");
    }
    if (comment && comment.length > 500) {
        flag = false;
        message.push("Comment must not exceed 500 characters in length.");
    }

    if (flag) {
        try {
            await connect();
            await begin();
            let resGetFeedback = await runPreparedQuery(getFeedbackByJobId, { id });
            if (resGetFeedback.recordset.length === 0) {
                let resGetJobOrder = await runPreparedQuery(getJobOrderById, { id, uid: req.user.Id });
                if (resGetJobOrder.recordset.length > 0) {
                    let data = resGetJobOrder.recordset[0];
                    if (data.latest_activity_status === "Completed" || data.latest_activity_status === "Cancelled") {
                        let resInsertFeedback = await runPreparedQueryTSQL(insertFeedback, 
                                                {  
                                                    id,
                                                    rate,
                                                    comment,
                                                    senderid: req.user.Id,
                                                    receiverid: data.RequestedTo
                                                }
                                            );
                        if (resInsertFeedback.rowsAffected > 0) {
                            await commit();
                            await disconnect();
                            res.status(200).json({ flag: true, message: [ `You have successfully submitted your feedback.` ] });
                        } else {
                            await rollback();
                            await disconnect();
                            res.status(200).json({ flag: false, message: [ `Failed to submit your feedback. Please try again.` ] });
                        }
                    } else {
                        res.status(200).json({ flag: false, message: [ `It seems like the job order selected is not in 'COMPLETED' or 'CANCELLED' status. Please try again.` ] });
                    }
                } else {
                    res.status(200).json({ flag: false, message: [ `Unable to find job order.` ] });
                }
            } else {
                res.status(200).json({ flag: false, message: [ `It seems like you have already given a feedback on this job order.` ] });
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