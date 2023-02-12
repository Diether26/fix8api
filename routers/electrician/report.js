const express = require('express');
const passport = require('passport');
const router = express.Router();

const { runPreparedQuery } = require('../../database');
const { getInvoices, getPaymentByID, getInvoiceById, getInvoiceItemsByInvoiceId } = require('../../queries/electrician/report');
const { isNumOnly } = require('../../utils/validation');

router.get('/invoices', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        let getGetInvoices = await runPreparedQuery(getInvoices, { uid: req.user.Id });
        res.status(200).json(
        { 
            flag: true, 
            invoices: getGetInvoices.recordset
        });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get('/invoice-details', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let flag = true;
    let message = [];
    let { id } = req.query;
    if (!isNumOnly(id)) {
        flag = false;
        message.push("Invalid ID detected, please try again.");
    }

    if (flag) {
        try {
            let resInvoiceDetails = await runPreparedQuery(getInvoiceById, { id, uid: req.user.Id });
            let resInvoiceItems = await runPreparedQuery(getInvoiceItemsByInvoiceId, { id });
            if (resInvoiceDetails.recordset.length > 0) {
                res.status(200).json(
                { 
                    flag: true, 
                    invoiceDetails: resInvoiceDetails.recordset[0],
                    invoiceItems: resInvoiceItems.recordset
                });
            } else {
                res.status(200).json(
                { 
                    flag: true, 
                    invoiceDetails: {},
                    invoiceItems: []
                });
            }
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    } else {
        res.status(200).json({ flag, message });
    }
});

router.get('/payment-details', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let flag = true;
    let message = [];
    let { id } = req.query;
    if (!isNumOnly(id)) {
        flag = false;
        message.push("Invalid ID detected, please try again.");
    }

    if (flag) {
        try {
            let resGetPaymentDetails = await runPreparedQuery(getPaymentByID, { id, uid: req.user.Id });
            if (resGetPaymentDetails.recordset.length > 0) {
                res.status(200).json(
                { 
                    flag: true, 
                    paymentDetails: resGetPaymentDetails.recordset[0]
                });
            } else {
                res.status(200).json(
                { 
                    flag: true, 
                    paymentDetails: {}
                });
            }
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    } else {
        res.status(200).json({ flag, message });
    }
});

module.exports = router;