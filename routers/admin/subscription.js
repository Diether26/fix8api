const express = require('express');
const passport = require('passport');
const { fetchQuery, runPreparedQuery } = require('../../database');
const { getListSubscriptions, checkSubscriptionStatus, approveSubscriptionPayment, rejectSubscriptionPayment, getSubscriptionPaymentDetails } = require('../../queries/admin/subscription');
const { isNumOnly } = require('../../utils/validation');
const router = express.Router();

router.get('/', passport.authenticate('jwt', {session: false}), fetchQuery(getListSubscriptions));

router.get('/payment-details', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
            let resGetSubscriptionPayment = await runPreparedQuery(getSubscriptionPaymentDetails, { id });    
            if (resGetSubscriptionPayment.recordset.length > 0) {
                res.status(200).json({ flag: true, paymentDetails: resGetSubscriptionPayment.recordset[0] });
            } else {
                res.status(200).json({ flag: false, message: [`Unable to find payment.`] });
            }            
        } catch (error) {
            console.log(error)
            res.sendStatus(500);
        }
    } else {
        res.status(200).json({ flag, message });
    }
});

router.post('/approve', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let flag = true;
    let message = [];
    let { id } = req.body;
    console.log(id)
    //validation
   
    //old password validation
    if (!isNumOnly(id)) {
        flag = false;
        message.push("Invalid ID detected. Please try again.");
    }
    //end validation

    //success 
    if (flag) {
        try {
            let resCheckSubStatus = await runPreparedQuery(checkSubscriptionStatus, { id });    
            console.log(resCheckSubStatus)        
            if (resCheckSubStatus.recordset.length > 0) {
                if (resCheckSubStatus.recordset[0].Status === "For Verification") {
                    let resApproveSubPayment = await runPreparedQuery(approveSubscriptionPayment, { id });
                    if (resApproveSubPayment.rowsAffected > 0) {
                        res.status(200).json({ flag: true, message: [`You have successfully approved subscription payment.`] });
                    } else {
                        res.status(200).json({ flag: false, message: [`Failed to approve subscription payment. Please try again.`] });
                    }
                } else {
                    res.status(200).json({ flag: false, message: [`Failed to approve subscription payment. Subscription status is not in For Verification.`] });
                }
            } else {
                res.status(200).json({ flag: false, message: [`Failed to approve subscription payment. Unable to find subscription.`] });
            }            
        } catch (error) {
            console.log(error)
            res.sendStatus(500);
        }
    } else {
        res.status(200).json({ flag, message });
    }
});

router.post('/reject', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
            let resCheckSubStatus = await runPreparedQuery(checkSubscriptionStatus, { id });      
            if (resCheckSubStatus.recordset.length > 0) {
                if (resCheckSubStatus.recordset[0].Status === "For Verification") {
                    let resRejectSubPayment = await runPreparedQuery(rejectSubscriptionPayment, { id });
                    if (resRejectSubPayment.rowsAffected > 0) {
                        res.status(200).json({ flag: true, message: [`You have successfully rejected subscription payment.`] });
                    } else {
                        res.status(200).json({ flag: false, message: [`Failed to reject subscription payment. Please try again.`] });
                    }
                } else {
                    res.status(200).json({ flag: false, message: [`Failed to reject subscription payment. Subscription status is not in For Verification.`] });
                }
            } else {
                res.status(200).json({ flag: false, message: [`Failed to reject subscription payment. Unable to find subscription.`] });
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