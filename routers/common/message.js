const express = require('express');
const passport = require('passport');
const router = express.Router();
const { runPreparedQuery } = require('../../database');
const { sendMessage, getMessages, getJobOrderById } = require('../../queries/message');
const { isNumOnly, isNotEmpty } = require('../../utils/validation');

router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let flag = true;
    let message = [];
    let { id, last_id } = req.query;
    if (!isNumOnly(id)) {
        flag = false;
        message.push("Invalid ID detected, please try again.");
    }
    if (!isNumOnly(last_id)) {
        flag = false;
        message.push("Invalid Last Message ID detected, please try again.");
    }

    if (flag) {
        try {
            let resGetJobOrder = await runPreparedQuery(getJobOrderById, { Id: id, uid: req.user.Id });
            if (resGetJobOrder.recordset.length > 0) {
                let resGetMessage = await runPreparedQuery(getMessages, { id, last_id });
                res.status(200).json(
                { 
                    flag: true,
                    message: resGetMessage.recordset
                });
            } else {
                res.status(200).json(
                { 
                    flag: false, 
                    message: [ `You are not authorized to view message with the job order ID you have provided.` ]
                });
            }
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    } else {
        res.status(200).json({ flag, message });
    }
})

router.post('/send', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let flag = true;
    let message = [];
    let { Id, Content } = req.body;
    if (!isNumOnly(Id)) {
        flag = false;
        message.push("Invalid ID detected, please try again.");
    }
    if (!isNotEmpty(Content)) {
        flag = false;
        message.push("Please add some content to the message.");
    }
    if (Content && Content.length > 500) {
        flag = false;
        message.push("Message content must not exceed 500 characters length.");
    }

    if (flag) {
        try {
            let resGetJobOrder = await runPreparedQuery(getJobOrderById, { Id, uid: req.user.Id });
            if (resGetJobOrder.recordset.length > 0) {
                // if (resGetJobOrder.recordset[0].latest_activity_status === "In Progress") {
                    let resSendMessage = await runPreparedQuery(sendMessage, { Id, Content, SenderId: req.user.Id });
                    if (resSendMessage.rowsAffected > 0) {
                        res.status(200).json(
                        { 
                            flag: true
                        });
                    } else {
                        res.status(200).json(
                        { 
                            flag: false, 
                            message: [ `Unable to send message. Please try again later.` ]
                        });
                    }
                // } else {
                //     res.status(200).json(
                //     { 
                //         flag: false, 
                //         message: [ `You can no longer send a message using the job order ID you have provided as it is currently or already in '${resGetJobOrder.recordset[0].latest_activity_status}' status. It must be 'In Progress' status.` ]
                //     });
                // }
            } else {
                res.status(200).json(
                { 
                    flag: false, 
                    message: [ `You are not authorized to send a message with the job order ID you have provided.` ]
                });
            }
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    } else {
        res.status(200).json({ flag, message });
    }
})

module.exports = router;