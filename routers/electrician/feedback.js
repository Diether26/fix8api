const express = require('express');
const passport = require('passport');
const router = express.Router();
const { runPreparedQuery } = require('../../database');
const { top5Feedback, feedbackCount, getAllFeedback } = require('../../queries/electrician/feedback');

router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        let resAllFeedback = await runPreparedQuery(getAllFeedback, { id: req.user.Id });
        res.status(200).json(
        { 
            feedback: resAllFeedback.recordset
        });
    } catch (error) {
        console.log(error)
        res.sendStatus(500);
    }
});

router.get('/top', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        let resTop5Feedback = await runPreparedQuery(top5Feedback, { id: req.user.Id });
        let resFeedbackCount = await runPreparedQuery(feedbackCount, { id: req.user.Id });
        res.status(200).json(
        { 
            feedback_top_five: resTop5Feedback.recordset, 
            feedback_count: resFeedbackCount.recordset[0].FeedbackCount, 
        });
    } catch (error) {
        console.log(error)
        res.sendStatus(500);
    }
});

module.exports = router;