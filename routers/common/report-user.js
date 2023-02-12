const express = require('express');
const passport = require('passport');
const router = express.Router();

const { isNumOnly } = require('../../utils/validation');
const { runPreparedQuery } = require('../../database');
const { reportUser, getJOById, checkIfReportExist } = require('../../queries/common');

router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let flag = true;
    let message = [];
    let { id } = req.body;
    //validation
    if (!isNumOnly(id)) {
        flag = false;
        message.push("Invalid ID detected. Please try again.");
    }
    //end validation

    //success 
    if (flag) {
        try {
            let resGetJOById = await runPreparedQuery(getJOById, { id, userid: req.user.Id });         
            if (resGetJOById.recordset.length > 0) {
                let JO_data = resGetJOById.recordset[0];
                let reporteduserid = JO_data.RequestedBy === req.user.Id ? JO_data.RequestedTo : JO_data.RequestedBy;
                let resCheckIfReportExist = await runPreparedQuery(checkIfReportExist, { job_id: id, reportedby: req.user.Id });
                if (resCheckIfReportExist.recordset.length === 0) {
                    let resReportUser = await runPreparedQuery(reportUser, { job_id: id, uid: reporteduserid, reportedby: req.user.Id });
                    if (resReportUser.rowsAffected > 0) {
                        res.status(200).json({ flag: true, message: [`You have successfully reported a user.`] });
                    } else {
                        res.status(200).json({ flag: false, message: [`Failed to report user. Please try again.`] });
                    }
                } else {
                    res.status(200).json({ flag: false, message: [`It seems like you have already reported this user.`] });
                }
            } else {
                res.status(200).json({ flag: false, message: [`Failed to report user. Unable to find user.`] });
            }            
        } catch (error) {
            console.log(error)
            res.sendStatus(500);
        }
    } else {
        res.status(200).json({ flag, message });
    }
})

module.exports = router;