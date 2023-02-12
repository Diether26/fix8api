const express = require('express');
const passport = require('passport');
const { fetchQuery, runPreparedQuery } = require('../../database');
const { getPayments, getInvoiceItem, getInvoiceDetail, getSubscription, getInvoiceRequestDetail } = require('../../queries/admin/payment');
const { isNumOnly } = require('../../utils/validation');

const router = express.Router();

router.get('/', passport.authenticate('jwt',{ session: false}), fetchQuery(getPayments));
router.get('/invoice-details', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let { id } = req.query;
    let flag = true;
    let message = [];

    if (!isNumOnly(id)) {
        flag = false;
        message.push("Invalid ID detected, please try again.");
    }
    if (flag) {
        try {
            let resAllInvoiceDet = await runPreparedQuery(getInvoiceDetail, { id });
            if (resAllInvoiceDet.recordset.length > 0) {
                res.status(200).json(
                { 
                    flag: true,
                    details: resAllInvoiceDet.recordset[0],
                });
            } else {
                res.status(200).json(
                { 
                    flag: false,
                    message: "Unable to find invoice details. please try again.",
                    payment: {}
                });
            }
        } catch (error) {
            console.log(error)
            res.sendStatus(500);
        }
    }
});
router.get('/invoice-item', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let { id } = req.query;
    let flag = true;
    let message = [];

    if (!isNumOnly(id)) {
        flag = false;
        message.push("Invalid ID detected, please try again.");
    }
    if (flag) {
        try {
            let resAllInvoiceItem = await runPreparedQuery(getInvoiceItem, { id });
            if (resAllInvoiceItem.recordset.length > 0) {
                res.status(200).json(
                { 
                    flag: true,
                    itemData: resAllInvoiceItem.recordset[0],
                });
            } else {
                res.status(200).json(
                { 
                    flag: false,
                    message: "Unable to find invoice item. please try again.",
                    payment: {}
                });
            }
        } catch (error) {
            console.log(error)
            res.sendStatus(500);
        }
    }
});
router.get('/subscription-detail', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let { id } = req.query;
    let flag = true;
    let message = [];

    if (!isNumOnly(id)) {
        flag = false;
        message.push("Invalid ID detected, please try again.");
    }
    if (flag) {
        try {
            let resAllSubscription = await runPreparedQuery(getSubscription, { id });
            if (resAllSubscription.recordset.length > 0) {
                res.status(200).json(
                { 
                    flag: true,
                    details: resAllSubscription.recordset[0],
                });
            } else {
                res.status(200).json(
                { 
                    flag: false,
                    message: "Unable to find subscription detail. please try again.",
                    payment: {}
                });
            }
        } catch (error) {
            console.log(error)
            res.sendStatus(500);
        }
    }
});
router.get('/invoice-request-detail', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let { id } = req.query;
    let flag = true;
    let message = [];

    if (!isNumOnly(id)) {
        flag = false;
        message.push("Invalid ID detected, please try again.");
    }
    if (flag) {
        try {
            let resAllReqDetail= await runPreparedQuery(getInvoiceRequestDetail, { id });
            if (resAllReqDetail.recordset.length > 0) {
                res.status(200).json(
                { 
                    flag: true,
                    details: resAllReqDetail.recordset[0],
                });
            } else {
                res.status(200).json(
                { 
                    flag: false,
                    message: "Unable to find invoice request detail. please try again.",
                    payment: {}
                });
            }
        } catch (error) {
            console.log(error)
            res.sendStatus(500);
        }
    }
});

module.exports = router;