const express = require('express');
const passport = require('passport');
const router = express.Router();
var formidable = require('formidable');
var fs = require('fs');

const { runPreparedQuery, runPreparedQueryTSQL, connect, begin, rollback, disconnect, commit } = require('../../database');
const { isNumOnly } = require('../../utils/validation');
const { checkSubscriptionStatus, insertSubscription, insertSubscriptionPayment } = require('../../queries/electrician/subscription');

router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        let resCheckSubStatus = await runPreparedQuery(checkSubscriptionStatus, { uid: req.user.Id });
        res.status(200).json(
        { 
            flag: true, 
            subscription: resCheckSubStatus.recordset.length > 0 ? resCheckSubStatus.recordset[0] : {}
        });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.post('/submit', passport.authenticate('jwt', { session: false }), async (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        let flag = true;
        let message = [];
        let { ReferenceNumber } = fields;
        //#region field validation
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
        if (req.user.hasSubscribed === 1) {
            flag = false;
            message.push("It seems like you already have subscribed. Please logout and login to refresh your information in the app.");
        }
         //#endregion field validation
         
        if (flag) {
            let receiptFileName = "";
            if (files.Receipt) {
                receiptFileName = makeRandomFilename(files.Receipt.name.length) + "." + getFileType(files.Receipt.type);
                var oldpath = files.Receipt.path; 
                var newpath = process.env.PUBLIC_FILES_PATH + 'payments\/subscription\/' + receiptFileName;
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
                    let resCheckStatus = await runPreparedQuery(checkSubscriptionStatus, 
                        { 
                            uid: req.user.Id
                        }
                    );
                    if (resCheckStatus.recordset.length > 0 && resCheckStatus.recordset[0].Status === 'For Verification') {
                        res.status(200).json({ flag: false, message: [ `It seems like you already have a subscription that is currently For Verification.` ] });
                    } else if (resCheckStatus.recordset.length > 0 && resCheckStatus.recordset[0].Status === 'Verified') {
                        res.status(200).json({ flag: false, message: [ `It seems like you already have a subscription that is currently Verified.` ] });
                    }  else {
                        let resInsertSubs = await runPreparedQueryTSQL(insertSubscription, { uid: req.user.Id });
                        if (resInsertSubs.recordset.length > 0) {
                            let resInsertPayment = await runPreparedQueryTSQL(insertSubscriptionPayment, {
                                subId: resInsertSubs.recordset[0].id,
                                paymentMethod: 'E-Wallet (GCASH)',
                                amount: process.env.SUBSCRIPTION_FEE,
                                referenceNumber: ReferenceNumber,
                                receipt: receiptFileName
                            });
                            if (resInsertPayment.rowsAffected > 0) {
                                await commit();
                                await disconnect();
                                res.status(200).json({ flag: true, message: [ `You have successfully submitted your payment for PREMIUM SUBSCRIPTION. Please wait for administrator's approval.` ] });
                            } else {
                                await rollback();
                                await disconnect();
                                res.status(200).json({ flag: false, message: [ `Unable to process your subscription. Please try again later.` ] });
                            }
                        } else {
                            await rollback();
                            await disconnect();
                            res.status(200).json({ flag: false, message: [ `Unable to process your subscription. Please try again laters.` ] });
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