const express = require('express');
const passport = require('passport');
const router = express.Router();
var formidable = require('formidable');
var fs = require('fs');

const {  runPreparedQuery, connect, begin, rollback, disconnect, runPreparedQueryTSQL, commit } = require('../../database');
const { getJobOrders, getJobOrderById, createJOActivity, countAcceptedJO, getContractById, createContract } = require('../../queries/electrician/joborder');
const { isNumOnly, isCharAndSpaceOnly, isNotEmpty, isValidDate } = require('../../utils/validation');
const { insertInvoice, insertInvoiceItem, insertBillingInfo, insertPaymentCashOnHand } = require('../../queries/electrician/invoice');
const { sendEmailInvoice } = require('../../utils/nodemailer/invoice');

router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        let resGetJobOrders = await runPreparedQuery(getJobOrders, { id: req.user.Id });
        res.status(200).json(
        { 
            flag: true, 
            jobOrders: resGetJobOrders.recordset
        });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get('/details', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let { id } = req.query;
    let flag = true;
    let message = [];
    if (!isNumOnly(id)) {
        flag = false;
        message.push("Invalid Request To or ID detected, please try again.");
    }
    if (flag) {
        try {
            let resGetJobOrder = await runPreparedQuery(getJobOrderById, { id, uid: req.user.Id });
            if (resGetJobOrder.recordset.length > 0) {
                res.status(200).json(
                { 
                    flag: true, 
                    jobOrder: resGetJobOrder.recordset[0]
                });
            } else {
                res.status(200).json(
                { 
                    flag: false, 
                    jobOrder: [],
                    message: [ `Unable to find job order.` ]
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

router.post('/accept', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let flag = true;
    let message = [];
    let { id } = req.body;
    if (!isNumOnly(id)) {
        flag = false;
        message.push("Invalid ID detected, please try again.");
    }

    if (flag) {
        try {
            await connect();
            await begin();
            if (req.user.hasSubscribed === 1) {
                let resGetJobOrder = await runPreparedQuery(getJobOrderById, { id, uid: req.user.Id });
                if (resGetJobOrder.recordset.length > 0) {
                    let data = resGetJobOrder.recordset[0];
                    if (data.latest_activity_status === "Requested") {
                        let resCreateJOActivity = await runPreparedQueryTSQL(createJOActivity, 
                                                {  
                                                    JobOrderId: id,
                                                    Status: 2,
                                                    Remarks: `${req.user.Lastname}, ${req.user.Firstname} ${req.user.Middlename} accepted the job order.`,
                                                    ActionBy: req.user.Id
                                                }
                                            );
                        if (resCreateJOActivity.rowsAffected > 0) {
                            await commit();
                            await disconnect();
                            res.status(200).json({ flag: true, message: [ `You have successfully accepted the job order.` ] });
                        } else {
                            await rollback();
                            await disconnect();
                            res.status(200).json({ flag: false, message: [ `Failed to accept job order. Please try again.` ] });
                        }
                    } else {
                        res.status(200).json({ flag: false, message: [ `It seems like the job order selected is no longer in 'REQUESTED' status. Please try again.` ] });
                    }
                } else {
                    res.status(200).json({ flag: false, message: [ `Unable to find job order.` ] });
                }
            } else {
                let resCountJO = await runPreparedQuery(countAcceptedJO, { id: req.user.Id });
                let count = resCountJO.recordset.length > 0 ? resCountJO.recordset[0].JO_COUNT : 0;
                if (count < 5) {
                    let resGetJobOrder = await runPreparedQuery(getJobOrderById, { id, uid: req.user.Id });
                    if (resGetJobOrder.recordset.length > 0) {
                        let data = resGetJobOrder.recordset[0];
                        if (data.latest_activity_status === "Requested") {
                            let resCreateJOActivity = await runPreparedQueryTSQL(createJOActivity, 
                                                    {  
                                                        JobOrderId: id,
                                                        Status: 2,
                                                        Remarks: `${req.user.Lastname}, ${req.user.Firstname} ${req.user.Middlename} accepted the job order.`,
                                                        ActionBy: req.user.Id
                                                    }
                                                );
                            if (resCreateJOActivity.rowsAffected > 0) {
                                await commit();
                                await disconnect();
                                res.status(200).json({ flag: true, message: [ `You have successfully accepted the job order.` ] });
                            } else {
                                await rollback();
                                await disconnect();
                                res.status(200).json({ flag: false, message: [ `Failed to accept job order. Please try again.` ] });
                            }
                        } else {
                            res.status(200).json({ flag: false, message: [ `It seems like the job order selected is no longer in 'REQUESTED' status. Please try again.` ] });
                        }
                    } else {
                        res.status(200).json({ flag: false, message: [ `Unable to find job order.` ] });
                    }
                } else {
                    res.status(200).json({ flag: false, message: [ `You have exceeded the maximum limit of Job Order for Regular Membership. Subscribe now to Premium Membership to accept UNLIMITED Job Orders!` ] });
                }
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

router.post('/reject', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let flag = true;
    let message = [];
    let { id } = req.body;
    if (!isNumOnly(id)) {
        flag = false;
        message.push("Invalid ID detected, please try again.");
    }

    if (flag) {
        try {
            await connect();
            await begin();
            let resGetJobOrder = await runPreparedQuery(getJobOrderById, { id, uid: req.user.Id });
            if (resGetJobOrder.recordset.length > 0) {
                let data = resGetJobOrder.recordset[0];
                if (data.latest_activity_status === "Requested") {
                    let resCreateJOActivity = await runPreparedQueryTSQL(createJOActivity, 
                                            {  
                                                JobOrderId: id,
                                                Status: 6,
                                                Remarks: `${req.user.Lastname}, ${req.user.Firstname} ${req.user.Middlename} rejected the job order.`,
                                                ActionBy: req.user.Id
                                            }
                                        );
                    if (resCreateJOActivity.rowsAffected > 0) {
                        await commit();
                        await disconnect();
                        res.status(200).json({ flag: true, message: [ `You have successfully rejected the job order.` ] });
                    } else {
                        await rollback();
                        await disconnect();
                        res.status(200).json({ flag: false, message: [ `Failed to reject job order. Please try again.` ] });
                    }
                } else {
                    res.status(200).json({ flag: false, message: [ `It seems like the job order selected is no longer in 'REQUESTED' status. Please try again.` ] });
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

router.post('/in-progress', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let flag = true;
    let message = [];
    let { id } = req.body;
    if (!isNumOnly(id)) {
        flag = false;
        message.push("Invalid ID detected, please try again.");
    }

    if (flag) {
        try {
            await connect();
            await begin();
            let resGetJobOrder = await runPreparedQuery(getJobOrderById, { id, uid: req.user.Id });
            if (resGetJobOrder.recordset.length > 0) {
                let data = resGetJobOrder.recordset[0];
                if (data.latest_activity_status === "Accepted") {
                    let resCreateJOActivity = await runPreparedQueryTSQL(createJOActivity, 
                                            {  
                                                JobOrderId: id,
                                                Status: 3,
                                                Remarks: `${req.user.Lastname}, ${req.user.Firstname} ${req.user.Middlename} set the job order status as in-progress.`,
                                                ActionBy: req.user.Id
                                            }
                                        );
                    if (resCreateJOActivity.rowsAffected > 0) {
                        await commit();
                        await disconnect();
                        res.status(200).json({ flag: true, message: [ `You have successfully set the job order status as in-progress.` ] });
                    } else {
                        await rollback();
                        await disconnect();
                        res.status(200).json({ flag: false, message: [ `Failed to set the job order status as in-progress. Please try again.` ] });
                    }
                } else {
                    res.status(200).json({ flag: false, message: [ `It seems like the job order selected is no longer in 'ACCEPTED' status. Please try again.` ] });
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

router.post('/done', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let flag = true;
    let message = [];
    let { id } = req.body;
    if (!isNumOnly(id)) {
        flag = false;
        message.push("Invalid ID detected, please try again.");
    }

    if (flag) {
        try {
            await connect();
            await begin();
            let resGetJobOrder = await runPreparedQuery(getJobOrderById, { id, uid: req.user.Id });
            if (resGetJobOrder.recordset.length > 0) {
                let data = resGetJobOrder.recordset[0];
                if (data.latest_activity_status === "In Progress") {
                    let resCreateJOActivity = await runPreparedQueryTSQL(createJOActivity, 
                                            {  
                                                JobOrderId: id,
                                                Status: 4,
                                                Remarks: `${req.user.Lastname}, ${req.user.Firstname} ${req.user.Middlename} set the job order status as done.`,
                                                ActionBy: req.user.Id
                                            }
                                        );
                    if (resCreateJOActivity.rowsAffected > 0) {
                        await commit();
                        await disconnect();
                        res.status(200).json({ flag: true, message: [ `You have successfully set the job order status as done.` ] });
                    } else {
                        await rollback();
                        await disconnect();
                        res.status(200).json({ flag: false, message: [ `Failed to set the job order status as complete. Please try again.` ] });
                    }
                } else {
                    res.status(200).json({ flag: false, message: [ `It seems like the job order selected is no longer in 'IN-PROGRESS' status. Please try again.` ] });
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

router.post('/create-invoice', passport.authenticate('jwt', { session: false }), async (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => { 
        let flag = true;
        let message = [];
        let { id, ServiceFee, DueDate, Items, PaymentMethod, AccountNumber, AccountHolder, BankName } = fields;
        let TotalCost = 0;
        let validItems = [];
        Items = JSON.parse(Items);
        try {
            if (Items.length === 1) {
                if (Items[0].description === '' || Items[0].unit === '' || Items[0].type === '') {
                    validItems = [];
                    TotalCost = parseFloat(ServiceFee);
                }
                else {
                    TotalCost = parseFloat(ServiceFee) + (parseFloat(Items[0].qty) * parseFloat(Items[0].price))
                    validItems.push(0);
                }
            }
            if (Items.length < 1) {
                itemCount = 0;
                TotalCost = parseFloat(ServiceFee);
                validItems = [];
            }
            if (Items.length > 1) {
                let i = 0;
                let total = 0;
                for (i; i < Items.length; i++) {
                    if (Items[i].description === '' || Items[i].unit === '' || Items[i].type === '') {
                        // itemCount = itemCount > 0 ? itemCount - 1 : itemCount;
                        // Items.splice(i, 1);
                    }
                    else {
                        if (!!Items[i].price && !!Items[i].qty) {
                          total += (parseFloat(Items[i].price) * parseFloat(Items[i].qty));
                          validItems.push(i);
                        } else {
                            // itemCount = itemCount > 0 ? itemCount - 1 : itemCount;
                            // Items.splice(i, 1);
                        }
                    }
                }
                TotalCost = parseFloat(ServiceFee) + parseFloat(total)
            }
            if (!isNumOnly(id)) {
                flag = false;
                message.push("Invalid ID detected, please try again.");
            }
            if (!isNumOnly(ServiceFee)) {
                flag = false;
                message.push("Service Fee must be a valid number or amount.");
            }
            if (!DueDate) {
                flag = false;
                message.push("Please enter due date.");
            }
            if (DueDate && DueDate.length > 1 && !isValidDate(DueDate)) {
                flag = false;
                message.push("Due Date must contain a valid date.")
            }
            if (!PaymentMethod) {
                flag = false;
                message.push("Please enter valid payment method.")
            }
            if (PaymentMethod && PaymentMethod !== 'Cash on Hand' && PaymentMethod !== 'E-Wallet (GCASH)') {
                flag = false;
                message.push("Please enter valid payment method.")
            }
            if (PaymentMethod && PaymentMethod === 'E-Wallet (GCASH)') {
                if (!AccountHolder) {
                    flag = false;
                    message.push("Please enter account holder.")
                }
                if (!AccountNumber) {
                    flag = false;
                    message.push("Please enter account number.")
                }
                if (!BankName) {
                    flag = false;
                    message.push("Please enter bank name.")
                }
                if (BankName && BankName !== 'GCASH') {
                    flag = false;
                    message.push("Please enter valid or recognized bank name.")
                }
                if (!files.QrCode) {
                    flag = false;
                    message.push("Please upload screenshot of your QR Code.")
                }
                if (files.QrCode) {
                    if (files.QrCode.size == 0) {
                        flag = false;
                        message.push("Cannot read your QR Code. Please try another one.")
                    }
                    if (files.QrCode.size > 0) {
                        if (files.QrCode && !files.QrCode.type.match(/(jpg|jpeg|png)$/i)) {
                            flag = false;
                            message.push("QR Code file type must be .jpg, .jpeg, and .png only.")
                        }
                    }
                }
            }
            if (TotalCost === 0 && validItems.length === 0) {
                flag = false;
                message.push("Failed to create invoice. Please try adding service fee or invoice items.")
            }
    
            if (flag) {
                try {
                    await connect();
                    await begin();
                    let resGetJobOrder = await runPreparedQuery(getJobOrderById, { id, uid: req.user.Id });
                    if (resGetJobOrder.recordset.length > 0) {
                        let data = resGetJobOrder.recordset[0];
                        if (data.latest_activity_status === "In Progress") {
                            let bDate = DueDate ? new Date(DueDate).toISOString().slice(0,10) : null;
                            let resInsertInvoice = await runPreparedQueryTSQL(insertInvoice, 
                                {  
                                    JobOrderId: id,
                                    ClientId: data.RequestedBy,
                                    ServiceFee,
                                    TotalCost: TotalCost,
                                    PaymentMethod,
                                    Status: 1,
                                    DueDate: bDate
                                }
                            );
                            if (resInsertInvoice.recordset.length > 0) {
                                if (validItems.length > 0) {
                                    let countInsertedItem = 0;
                                    for(let a = 0; a < validItems.length; a++) {
                                        let resInsertInvoiceItems = await runPreparedQueryTSQL(insertInvoiceItem, {
                                            InvoiceID: resInsertInvoice.recordset[0].id,
                                            Name: Items[validItems[a]].description,
                                            Quantity: Items[validItems[a]].qty,
                                            Unit: Items[validItems[a]].unit,
                                            Type: Items[validItems[a]].type,
                                            Price: Items[validItems[a]].price
                                        });
                                        if (resInsertInvoiceItems.rowsAffected > 0) {
                                            countInsertedItem++;
                                        }
                                    }
                                    if (countInsertedItem === validItems.length) {
                                        flag = true;
                                    } else {
                                        flag = false;
                                        message.push("Failed to create invoice - unable to insert invoice items. Please try again later.");
                                    }
                                }
                                
                                if (flag) {
                                    let qrCodeFileName;
                                    if (PaymentMethod === 'E-Wallet (GCASH)') {
                                        if (files.QrCode) {
                                            qrCodeFileName = makeRandomFilename(files.QrCode.name.length) + "." + getFileType(files.QrCode.type);
                                            var oldpath = files.QrCode.path; 
                                            var newpath = process.env.PUBLIC_FILES_PATH + 'invoice\/billing-info\/' + qrCodeFileName;
                                            fs.rename(oldpath, newpath, async (err) => {
                                                if (err) {
                                                    flag = false;
                                                    message.push("Failed to upload your QR Code! Please try again.");
                                                }                                  
                                            });
                                        }
                                        
                                        let resInsertBilling = await runPreparedQueryTSQL(insertBillingInfo, {
                                            InvoiceID: resInsertInvoice.recordset[0].id,
                                            BankName,
                                            AccountNumber,
                                            AccountHolder,
                                            QrCode: qrCodeFileName
                                        });
                                        if (resInsertBilling.rowsAffected < 1) {
                                            flag = false;
                                            message.push("Failed to create invoice - unable to insert billing info! Please try again.");
                                        }
                                    } 

                                    let resCreateJOActivity = await runPreparedQueryTSQL(createJOActivity, 
                                        {  
                                            JobOrderId: id,
                                            Status: 4,
                                            Remarks: `${req.user.Lastname}, ${req.user.Firstname} ${req.user.Middlename} sets the job order status as done.`,
                                            ActionBy: req.user.Id
                                        }
                                    );

                                    if (resCreateJOActivity.rowsAffected < 1) {
                                        flag = false;
                                        message.push("Failed to create invoice - unable to update job order status! Please try again.");
                                    }

                                    if (flag) {
                                        let sendmailInvoice = await sendEmailInvoice(
                                            JO_Details = data, 
                                            InvoiceID =  resInsertInvoice.recordset[0].id,
                                            InvoiceDueDate = bDate,
                                            PaymentMethod,
                                            ServiceFee,
                                            AmountDue = TotalCost,
                                            Items,
                                            validItems,
                                            BankName,
                                            AccountNumber,
                                            AccountHolder,
                                            QrCode = qrCodeFileName
                                        );
                                        if (sendmailInvoice) {
                                            await commit();
                                            await disconnect();
                                            res.status(200).json({ flag: true, message: [`You have successfully created an invoice.`] });
                                        } else {
                                            await rollback();
                                            await disconnect();
                                            res.status(200).json({ flag: false, message: [`Failed to create invoice - unable to send email. Please try again later.`] });
                                        }
                                    } else {
                                        await rollback();
                                        await disconnect();
                                        res.status(200).json({ flag, message });
                                    }
                                }else {
                                    await rollback();
                                    await disconnect();
                                    res.status(200).json({ flag, message });
                                }
                            } else {
                                await rollback();
                                await disconnect();
                                res.status(200).json({ flag: false, message: [ `Failed to create invoice. Please try again.` ] });
                            }
                        } else {
                            res.status(200).json({ flag: false, message: [ `It seems like the job order selected is no longer in 'IN-PROGRESS' status. Please try again.` ] });
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
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }        
    });    
})

router.post('/request-contract', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let flag = true;
    let message = [];
    let { id } = req.body;
    if (!isNumOnly(id)) {
        flag = false;
        message.push("Invalid ID detected, please try again.");
    }

    if (req.user.hasSubscribed !== 1) {
        flag = false;
        message.push("This functionality is for premium members only. Subscribe now to get an exclusive contract!");
    }

    if (flag) {
        try {
            let resGetJobOrder = await runPreparedQuery(getJobOrderById, { id, uid: req.user.Id });
            if (resGetJobOrder.recordset.length > 0) {
                let resGetContract = await runPreparedQuery(getContractById, { id });
                if (resGetContract.recordset.length === 0) {
                    let resCreateContract = await runPreparedQuery(createContract, { id });
                    if (resCreateContract.rowsAffected > 0) {
                        res.status(200).json({ flag: true, message: [ `You have successfully requested for a contract.` ] });
                    } else {
                        res.status(200).json({ flag: false, message: [ `Failed to request a contract. Please try again.` ] });
                    }
                } else {
                    res.status(200).json({ flag: false, message: [ `Your contract is still in progress. Please check back later.` ] });
                }
            } else {
                res.status(200).json({ flag: false, message: [ `Unable to find job order.` ] });
            }
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    } else {
        res.status(200).json({ flag, message });
    }
})

router.get('/view-contract', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let flag = true;
    let message = [];
    let { id } = req.query;
    if (!isNumOnly(id)) {
        flag = false;
        message.push("Invalid ID detected, please try again.");
    }
    
    if (req.user.hasSubscribed !== 1) {
        flag = false;
        message.push("This functionality is for premium members only. Subscribe now to get an exclusive contract!");
    }

    if (flag) {
        try {
            let resGetJobOrder = await runPreparedQuery(getJobOrderById, { id, uid: req.user.Id });
            if (resGetJobOrder.recordset.length > 0) {
                let resGetContract = await runPreparedQuery(getContractById, { id });
                if (resGetContract.recordset.length > 0) {
                    res.status(200).json({ flag: true, contractDetails: resGetContract.recordset[0] });
                } else {
                    res.status(200).json({ flag: false, message: [ `Unable to find contract. Please request for a contract first!` ] });
                }
            } else {
                res.status(200).json({ flag: false, message: [ `Unable to find job contract. Job order ID does not exist on the system.` ] });
            }
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    } else {
        res.status(200).json({ flag, message });
    }
})

function makeRandomFilename(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * 
        charactersLength));
   }
   return result;
}

function getFileType(file){
    return file.split('/')[1];
}

module.exports = router;