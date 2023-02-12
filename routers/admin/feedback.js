const express = require('express');
const passport = require('passport');
const { fetchQuery, runPreparedQuery, } = require('../../database');
const { getFeedbacks, getFeedbackById, deleteFeedback } = require('../../queries/admin/feedback');
const { isNumOnly } = require('../../utils/validation');
const router = express.Router();

router.get('/', passport.authenticate('jwt', {session: false}), fetchQuery(getFeedbacks));

router.get('/details', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let flag = true;
    let message = [];
    let { id } = req.query;
    //validation
    if (!isNumOnly(id)) {
        flag = false;
        message.push("Invalid ID detected. Please try again.");
    }
    //end validation

    //success 
    if (flag) {
        try {
            let resGetFeedback = await runPreparedQuery(getFeedbackById, { id });    
            if (resGetFeedback.recordset.length > 0) {
                res.status(200).json({ flag: true, feedbackDetails: resGetFeedback.recordset[0] });
            } else {
                res.status(200).json({ flag: false, message: [`Unable to find feedback.`] });
            }            
        } catch (error) {
            console.log(error)
            res.sendStatus(500);
        }
    } else {
        res.status(200).json({ flag, message });
    }
});

router.post('/delete', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
            let resGetFeedback = await runPreparedQuery(getFeedbackById, { id });    
            if (resGetFeedback.recordset.length > 0) {
                let resDeleteFeedback = await runPreparedQuery(deleteFeedback, { id });   
                if (resDeleteFeedback.rowsAffected > 0) {
                    res.status(200).json({ flag: true, message: [`You have successfully deleted feedback!`] });
                } else {
                    res.status(200).json({ flag: false, message: [`Unable to delete feedback. Please try again later.`] });
                }
            } else {
                res.status(200).json({ flag: false, message: [`Unable to find feedback.`] });
            }            
        } catch (error) {
            console.log(error)
            res.sendStatus(500);
        }
    } else {
        res.status(200).json({ flag, message });
    }
});


module.exports = router;