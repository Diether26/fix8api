const express = require('express');
const passport = require('passport');
const router = express.Router();
var formidable = require('formidable');
var fs = require('fs');

const { isNumOnly, isValidDate, isCharAndSpaceOnly, isValidPhoneNumber, isNotEmpty } = require('../../utils/validation');
const { runPreparedQueryTSQL, connect, begin, commit, disconnect, rollback, runPreparedQuery } = require('../../database');
const { createJobOrder, createJOActivity, getJobOrders, getJobOrderById } = require('../../queries/homeowner/joborder');
const { getFeedbackByJobId } = require('../../queries/homeowner/feedback');
const { getInvoiceByJOId, insertPayment, markInvoiceAsPaid } = require('../../queries/homeowner/invoice');
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
            let resGetFeedback = await runPreparedQuery(getFeedbackByJobId, { id });
            if (resGetJobOrder.recordset.length > 0) {
                res.status(200).json(
                { 
                    flag: true, 
                    jobOrder: resGetJobOrder.recordset[0],
                    hasFeedback: resGetFeedback.recordset.length > 0 ? true : false
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

router.post('/create', passport.authenticate('jwt', { session: false }), async (req, res) => {
   var form = new formidable.IncomingForm();
   form.parse(req, async (err, fields, files) => {
        let flag = true;
        let message = [];
        let {
            ServiceName,
            JobType,
            Description,
            ContactNumber,
            Location,
            AppointmentDate,
            RequestedTo
        } = fields;
        
        //#region field validation
        if (!isCharAndSpaceOnly(ServiceName)) {
            flag = false;
            message.push("Service name is required and must contain letters and spaces only.")
        }
        if (!isCharAndSpaceOnly(JobType)) {
            flag = false;
            message.push("Job type is required and must contain letters and spaces only.")
        }
        if (Description && Description.length > 500) {
            flag = false;
            message.push("Description length must be less than or equal to 500 characters.")
        }
        if (!isValidPhoneNumber(ContactNumber)) {
            flag = false;
            message.push("Invalid phone number. Example of valid phone number: 09123123123 or +639123123123")
        }
        if (!Location) {
            flag = false;
            message.push("Location is missing.")
        }
        if (Location && Location.length > 500) {
            flag = false;
            message.push("Location length must be less than or equal to 500 characters.")
        }
        if (!AppointmentDate) {
            flag = false;
            message.push("Please enter appointmend date.")
        }
        if (AppointmentDate && AppointmentDate.length > 1 && !isValidDate(AppointmentDate)) {
            flag = false;
            message.push("Appointment date must contain a valid date.")
        }
        if (!isNumOnly(RequestedTo)) {
            flag = false;
            message.push("Invalid Request To or ID detected, please try again.");
        }
        if (ServiceName === "Installation" && !files.BuildingPermit) {
            flag = false;
            message.push("Building permit file or picture is required if you selected installation services.")
        }
        if (ServiceName === "Installation" && files.BuildingPermit) {
            if (files.BuildingPermit.size == 0) {
                flag = false;
                message.push("Cannot read your building permit file. Please try another one.")
            }
            if (files.BuildingPermit.size > 0) {
                if (files.BuildingPermit && !files.BuildingPermit.type.match(/(jpg|jpeg|png)$/i)) {
                    flag = false;
                    message.push("Building permit file type must be .jpg, .jpeg, and .png only.")
                }
            }
        }
        if (ServiceName === "Installation" && !files.Blueprint) {
            flag = false;
            message.push("Blueprint file or picture is required if you selected installation services.")
        }
        if (ServiceName === "Installation" && files.Blueprint) {
            if (files.Blueprint.size == 0) {
                flag = false;
                message.push("Cannot read your blueprint file. Please try another one.")
            }
            if (files.Blueprint.size > 0) {
                if (files.Blueprint && !files.Blueprint.type.match(/(jpg|jpeg|png)$/i)) {
                    flag = false;
                    message.push("Blueprint file type must be .jpg, .jpeg, and .png only.")
                }
            }
        }
        //#endregion field validation
        
        if (flag) {
            let buildingPermitFileName = "";
            let blueprintFileName = "";
            if (ServiceName === "Installation" && files.BuildingPermit) {
                buildingPermitFileName = makeRandomFilename(files.BuildingPermit.name.length) + "." + getFileType(files.BuildingPermit.type);
                var oldpath = files.BuildingPermit.path; 
                var newpath = process.env.PUBLIC_FILES_PATH + 'attachments\/building-permit\/' + buildingPermitFileName;
                fs.rename(oldpath, newpath, async (err) => {
                    if (err) {
                        flag = false;
                        message.push("Failed to upload your building permit! Please try again.");
                    }                                  
                });
            }
            if (ServiceName === "Installation" && files.Blueprint) {
                blueprintFileName = makeRandomFilename(files.Blueprint.name.length) + "." + getFileType(files.Blueprint.type);
                var oldpath = files.Blueprint.path; 
                var newpath = process.env.PUBLIC_FILES_PATH + 'attachments\/blueprint\/' + blueprintFileName;
                fs.rename(oldpath, newpath, async (err) => {
                    if (err) {
                        flag = false;
                        message.push("Failed to upload your blueprint! Please try again.");
                    }                                  
                });
            }
            if (flag) {
                try {
                    await connect();
                    await begin();
                    let aDate = AppointmentDate ? new Date(AppointmentDate).toISOString().slice(0,10) : null;
                    let respCreateJobOrder = await runPreparedQueryTSQL(createJobOrder, 
                        { 
                            ServiceName,
                            JobType,
                            Description,
                            ContactNumber,
                            Location,
                            BuildingPermit: buildingPermitFileName,
                            Blueprint: blueprintFileName,
                            AppointmentDate: aDate,
                            RequestedTo,
                            RequestedBy: req.user.Id
                        }
                    );
                    await runPreparedQueryTSQL(createJOActivity, 
                        {  
                            JobOrderId: respCreateJobOrder.recordset[0].id,
                            Status: 1,
                            Remarks: `${req.user.Lastname}, ${req.user.Firstname} ${req.user.Middlename} requested new job order.`,
                            ActionBy: req.user.Id
                        }
                    );
                    if (respCreateJobOrder.rowsAffected[0] > 0) {
                        await commit();
                        await disconnect();
                        res.status(200).json({ flag: true, message: [ `Successfully created new job order.!` ] });
                    } else {
                        await rollback();
                        await disconnect();
                        res.status(200).json({ flag: false, message: [ `Failed to create new job order. Please try again.` ] });
                    }
                } catch (error) {
                    console.log(error)
                    await rollback();
                    await disconnect();
                    res.sendStatus(500);
                }   
            } else {
                res.status(200).json({ flag, message });
            }         
        } else {
            res.status(200).json({ flag, message });
        }                
   })
});

router.post('/cancel', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let flag = true;
    let message = [];
    let { id, reason } = req.body;
    if (!isNumOnly(id)) {
        flag = false;
        message.push("Invalid ID detected, please try again.");
    }

    if (!reason) {
        flag = false;
        message.push("Please enter reason why you want to cancel this job order.");
    }
    if (reason && !isCharAndSpaceOnly(reason)) {
        flag = false;
        message.push("Reason message must not contain special characters.");
    }

    if (reason && reason.length > 500) {
        flag = false;
        message.push("Reason message must not exceed 500 characters in length.");
    }

    if (flag) {
        try {
            await connect();
            await begin();
            let resGetJobOrder = await runPreparedQuery(getJobOrderById, { id, uid: req.user.Id });
            if (resGetJobOrder.recordset.length > 0) {
                let data = resGetJobOrder.recordset[0];
                if (data.latest_activity_status === "Accepted" || data.latest_activity_status === "In Progress" || data.latest_activity_status === "Requested") {
                    let resCreateJOActivity = await runPreparedQueryTSQL(createJOActivity, 
                                            {  
                                                JobOrderId: id,
                                                Status: 5,
                                                Remarks: `${req.user.Lastname}, ${req.user.Firstname} ${req.user.Middlename} cancelled the job order. | Reason: ${reason}`,
                                                ActionBy: req.user.Id
                                            }
                                        );
                    if (resCreateJOActivity.rowsAffected > 0) {
                        await commit();
                        await disconnect();
                        res.status(200).json({ flag: true, message: [ `You have successfully cancelled the job order.` ] });
                    } else {
                        await rollback();
                        await disconnect();
                        res.status(200).json({ flag: false, message: [ `Failed to cancel job order. Please try again.` ] });
                    }
                } else {
                    res.status(200).json({ flag: false, message: [ `It seems like the job order selected is no longer in 'ACCEPTED' or 'IN-PROGRESS' status. Please try again.` ] });
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

router.post('/submit-payment', passport.authenticate('jwt', { session: false }), async (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        let flag = true;
        let message = [];
        let { id, PaymentMethod, ReferenceNumber } = fields;
        //#region field validation
        if (!isNumOnly(id)) {
            flag = false;
            message.push("Invalid ID detected, please try again.");
        }
        if (!PaymentMethod) {
            flag = false;
            message.push("Please enter payment method for your proof of payment.");
        }
        if (PaymentMethod && PaymentMethod !== 'Cash on Hand' && PaymentMethod !== 'E-Wallet (GCASH)') {
            flag = false;
            message.push("Please enter payment method for your proof of payment.");
        }
        if (PaymentMethod && PaymentMethod === 'E-Wallet (GCASH)') {
            if (!ReferenceNumber) {
                flag = false;
                message.push("Please enter reference number for your proof of payment.");
            }
            if (!files.Receipt) {
                flag = false;
                message.push("Please upload payment reciept for your proof of payment.");
            }
            if (files.Receipt) {
                if (files.Receipt.size == 0) {
                    flag = false;
                    message.push("Cannot read your payment receipt file Please try another one.")
                }
                if (files.Receipt.size > 0) {
                    if (files.Receipt && !files.Receipt.type.match(/(jpg|jpeg|png)$/i)) {
                        flag = false;
                        message.push("Payment receipt file type must be .jpg, .jpeg, and .png only.")
                    }
                }
            }
        }
         //#endregion field validation
         
        if (flag) {
            let receiptFileName = "";
            if (files.Receipt && PaymentMethod === 'E-Wallet (GCASH)') {
                receiptFileName = makeRandomFilename(files.Receipt.name.length) + "." + getFileType(files.Receipt.type);
                var oldpath = files.Receipt.path; 
                var newpath = process.env.PUBLIC_FILES_PATH + 'payments\/joborder-invoice\/' + receiptFileName;
                fs.rename(oldpath, newpath, async (err) => {
                    if (err) {
                        flag = false;
                        message.push("Failed to upload your payment receipt! Please try again.");
                    }                                  
                });
            }             
            if (flag) {
                try {
                    await connect();
                    await begin();
                    let resGetJobOrder = await runPreparedQuery(getJobOrderById, { id, uid: req.user.Id });
                    if (resGetJobOrder.recordset.length > 0) {
                        let data = resGetJobOrder.recordset[0];
                        if (data.latest_activity_status === "Done") {
                            let resGetInvoice = await runPreparedQuery(getInvoiceByJOId, { id: data.Id });
                            if (resGetInvoice.recordset.length > 0) {
                                let dataInvoice = resGetInvoice.recordset[0];
                                let resInsertPayment = await runPreparedQueryTSQL(insertPayment, {
                                    InvoiceID: dataInvoice.Id,
                                    PaymentMethod,
                                    Amount: dataInvoice.TotalCost,
                                    ReferenceNumber,
                                    PaymentReceipt:receiptFileName,
                                    Status: 3
                                });
                                if (resInsertPayment.rowsAffected > 0) {
                                    let resMarkInvoicePaid = await runPreparedQueryTSQL(markInvoiceAsPaid, { id: dataInvoice.Id });
                                    if (resMarkInvoicePaid.rowsAffected > 0) {
                                        let resCreateJOActivity = await runPreparedQueryTSQL(createJOActivity, 
                                            {  
                                                JobOrderId: id,
                                                Status: 10,
                                                Remarks: `${req.user.Lastname}, ${req.user.Firstname} ${req.user.Middlename} sets the job order status as completed.`,
                                                ActionBy: req.user.Id
                                            }
                                        );
                                        if (resCreateJOActivity.rowsAffected > 0) {
                                            await commit();
                                            await disconnect();
                                            res.status(200).json({ flag: true, message: [ `You have successfully processed your payment!` ] });
                                        } else {
                                            await rollback();
                                            await disconnect();
                                            res.status(200).json({ flag: false, message: [ `Failed to process your payment - unable to update your job order.` ] });
                                        }
                                    } else {
                                        await rollback();
                                        await disconnect();
                                        res.status(200).json({ flag: false, message: [ `Failed to process your payment - unable to update your invoice.` ] });
                                    }
                                } else {
                                    await rollback();
                                    await disconnect();
                                    res.status(200).json({ flag: false, message: [ `Failed to process your payment - unable to save your payment.` ] });
                                }
                            } else {
                                res.status(200).json({ flag: false, message: [ `Failed to process your payment - unable to find any invoice.` ] });
                            }
                        } else {
                            res.status(200).json({ flag: false, message: [ `It seems like the job order selected is no longer or not yet in 'DONE' status. Please try again.` ] });
                        }
                    } else {
                        res.status(200).json({ flag: false, message: [ `Unable to find job order. Please try again laters.` ] });
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
        } else {
            res.status(200).json({ flag, message });
        }                
    })
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