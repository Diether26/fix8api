const express = require('express');
const passport = require('passport');
const { runPreparedQuery, fetchQuery, } = require('../../database');
const { 
    getCountJORequestedStatus,
    getCountJOAcceptedStatus,
    getCountJOInProgressStatus,
    getCountJORejectedStatus,
    getCountJOCancelledStatus,
    getCountJOCompletedStatus, 
    getCountJODoneStatus,
    getPremiumUsers,
    getCountAllUsers,
    getCountRequestContract
} = require('../../queries/admin/dashboard');
const { isValidDate } = require('../../utils/validation');
const router = express.Router();

router.get('/job-order-statuses', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let flag = true;
    let message = [];
    let { from_date, to_date } = req.query;

    console.log(req.query)

    if (!from_date) {
        flag = false;
        message.push("From Date is required.")
    }
    if (from_date && from_date.length > 1 && !isValidDate(from_date)) {
        flag = false;
        message.push("From Date must contain a valid date.")
    }
    if (!to_date) {
        flag = false;
        message.push("To Date is required.")
    }
    if (to_date && to_date.length > 1 && !isValidDate(to_date)) {
        flag = false;
        message.push("To Date must contain a valid date.")
    }
    if (flag) {
        try {
            from_date = from_date ? new Date(from_date).toISOString().slice(0,10) : null;
            to_date = to_date ? new Date(to_date).toISOString().slice(0,10) : null;
            let [ 
                resCountRequested,
                resCountAccepted,
                resCountINP,
                resCountRejected,
                resCountCancelled,
                resCountDone,
                resCountCompleted
            ] = await Promise.all([
                runPreparedQuery(getCountJORequestedStatus, { from_date, to_date }), 
                runPreparedQuery(getCountJOAcceptedStatus, { from_date, to_date }),
                runPreparedQuery(getCountJOInProgressStatus, { from_date, to_date }),
                runPreparedQuery(getCountJORejectedStatus, { from_date, to_date }),
                runPreparedQuery(getCountJOCancelledStatus, { from_date, to_date }),
                runPreparedQuery(getCountJODoneStatus, { from_date, to_date }),
                runPreparedQuery(getCountJOCompletedStatus, { from_date, to_date })
            ])
            res.status(200).json(
                { 
                    flag: true, 
                    labels: [ "Requested", "In Progress", "Rejected", "Cancelled", "Completed" ],
                    series: [ 
                        resCountRequested.recordset[0].Count,
                        resCountINP.recordset[0].Count, 
                        resCountRejected.recordset[0].Count,
                        resCountCancelled.recordset[0].Count,
                        resCountCompleted.recordset[0].Count
                    ],
                    requested: resCountRequested.recordset[0], 
                    accepted: resCountAccepted.recordset[0], 
                    inprogress: resCountINP.recordset[0], 
                    rejected: resCountRejected.recordset[0], 
                    cancelled: resCountCancelled.recordset[0], 
                    done: resCountDone.recordset[0], 
                    completed: resCountCompleted.recordset[0]
                    
                }
            );        
        } catch (error) {
            console.log(error)
            res.sendStatus(500);
        }
    } else {
        res.status(200).json({ flag, message });
    }
});

router.get('/premium-users-count', passport.authenticate('jwt', {session: false}), fetchQuery(getPremiumUsers));

router.get('/all-users-count', passport.authenticate('jwt', {session: false}), fetchQuery(getCountAllUsers));

router.get('/request-contract-count', passport.authenticate('jwt', {session: false}), fetchQuery(getCountRequestContract));


module.exports = router;