const express = require('express');
const passport = require('passport');
const router = express.Router();
const { fetchQuery, runPreparedQuery } = require('../../database');
const { getElectricianFeedback, getElectricianTop5Feedback } = require('../../queries/homeowner/main');
const { getElectricianFeedbackSummary } = require('../../queries/homeowner/main');
const { getActiveElectricians, getElectricianById } = require('../../queries/homeowner/main');
const { isNumOnly } = require('../../utils/validation');

router.get('/electricians', passport.authenticate('jwt', { session: false }), fetchQuery(getActiveElectricians));

router.get('/electrician', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let flag = true;
    let message = [];
    let { id } = req.query;
    if (!isNumOnly(id)) {
        flag = false;
        message.push("Invalid ID detected, please try again.");
    }

    if (flag) {
        try {
            let resGetElectrician = await runPreparedQuery(getElectricianById, { id });
            let resGetElectricianTopFiveFeedback = await runPreparedQuery(getElectricianTop5Feedback, { id });
            let resGetElectricianFeedbackSummary = await runPreparedQuery(getElectricianFeedbackSummary, { id });
            if (resGetElectrician.rowsAffected > 0) {
                res.status(200).json(
                    { 
                        flag: true, 
                        userdata: resGetElectrician.recordset[0], 
                        feedback: resGetElectricianTopFiveFeedback.recordset, 
                        feedback_summary: resGetElectricianFeedbackSummary.recordset[0], 
                    });
            } else {
                res.status(200).json({ flag: false, message: [ `Unable to find electrician.` ] });
            }
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    } else {
        res.status(200).json({ flag, message });
    }
})

router.get('/electrician-feedback', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let flag = true;
    let message = [];
    let { id } = req.query;
    if (!isNumOnly(id)) {
        flag = false;
        message.push("Invalid ID detected, please try again.");
    }

    if (flag) {
        try {
            let resGetElectricianFeedback = await runPreparedQuery(getElectricianFeedback, { id });
            res.status(200).json(
            { 
                feedback: resGetElectricianFeedback.recordset
            });
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    } else {
        res.status(200).json({ flag, message });
    }
})

module.exports = router;