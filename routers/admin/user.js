const express = require('express');
const formidable = require('formidable');
const fs = require('fs');
const passport = require('passport');
const { runPreparedQuery, fetchQuery } = require('../../database');
const { getUsers, updateUser, deactivateUser, activateUser, banUser, deleteUser } = require('../../queries/admin/user');
const { getUsersById } = require('../../queries/admin/user');
const { getUserByEmail } = require('../../queries/admin/user');
const { isCharAndSpaceOnly, isValidEmail, isValidPhoneNumber, isCharOnly, isValidMinLength, isValidMaxLength, isCharNumOnly, isValidDate, isNumOnly } = require('../../utils/validation');

const router = express.Router();

router.get('/', passport.authenticate('jwt',{ session: false}), fetchQuery(getUsers));

router.get('/details', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let { id } = req.query;
    let flag = true;
    let message = [];
    // if (!isNumOnly(id)) {
    //     flag = false;
    //     message.push("Invalid Request To or ID detected, please try again.");
    // }
    if (flag) {
        try {
            let resGetUser = await runPreparedQuery(getUsersById, { id });
            if (resGetUser.recordset.length > 0) {
                res.status(200).json(
                { 
                    flag: true, 
                    userDetail: resGetUser.recordset[0]
                });
            } else {
                res.status(200).json(
                { 
                    flag: false, 
                    userDetail: [],
                    message: [ `Unable to find user.` ]
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

router.post('/update', passport.authenticate('jwt', {session: false}), async (req,res) => {
        let flag = true;
        let message = [];
        let{
            Firstname,
            Middlename,
            Lastname,
            Email,
            Contactnumber,
            Birthdate,
            Sex,
            Address,
            Username,
            Password
        } = req.body;

        //#region field validation
        if (!isCharAndSpaceOnly(Firstname)) {
            flag = false;
            message.push("Firstname must contain letters and spaces only.")
        }
        if (Middlename && !isCharAndSpaceOnly(Middlename)) {
            flag = false;
            message.push("Middlename must contain letters and spaces only.")
        }
        if (!isCharAndSpaceOnly(Lastname)) {
            flag = false;
            message.push("Lastname must contain letters and spaces only.")
        }
        if (!isValidEmail(Email)) {
            flag = false;
            message.push("Email must be a valid email address.")
        }
        if (!isValidPhoneNumber(Contactnumber)) {
            flag = false;
            message.push("Invalid phone number. Example of valid phone number: 09123123123 or +639123123123")
        }
        if (!Address) {
            flag = false;
            message.push("Address is missing.")
        }
        if (Address && Address.length > 500) {
            flag = false;
            message.push("Address length must be less than or equal to 500 characters.")
        }
        if (Birthdate && Birthdate.length > 1 && !isValidDate(Birthdate)) {
            flag = false;
            message.push("Birthdate must contain a valid date.")
        }
        if (!isCharOnly(Sex)) {
            flag = false;
            message.push("Sex or Gender must contain only characters.")
        }
        if(!Username){
            flag = false;
            message.push("Username must not be empty.")
        }
        if(!isValidMinLength(Password)){
            flag = false;
            message.push("Username must be minimum of 6 characters only.");
        }
        if(!isValidMaxLength(Password)){
            flag = false;
            message.push("Username must be maximum of 12 characters only.");
        }
        if (isCharNumOnly(Password)) {
            flag = false;
            message.push("Password must contain at least 1 special characters.");
        }
        if(!isValidMinLength(Password)){
            flag = false;
            message.push("Password must be minimum of 6 characters only.");
        }
        if(!isValidMaxLength(Password)){
            flag = false;
            message.push("Password must be maximum of 12 characters only.");
        }
        //#endregion field validation

        if(flag){
            try{
                let resGetUserByEmail = await runPreparedQuery(getUserByEmail,{ email: Email });
                if(resGetUserByEmail.rowsAffected > 0 && req.user.Email !== Email){
                    flag = false;
                    message.push("Email is already in use");
                }
                if(flag){
                    let bDate = Birthdate ? new Date(Birthdate).toISOString().slice(0,10) : null;
                    let resUpdateUser = await runPreparedQuery(updateUser,
                        {
                            Firstname,
                            Middlename,
                            Lastname,
                            Email,
                            Contactnumber,
                            Birthdate:bDate,
                            Sex,
                            Address,
                            Username,
                            Password,
                            id:req.user.Id
                        }
                    );
                    if(resUpdateUser.rowsAffected > 0){
                        res.status(200).json({ flag: true, message:[`Successfully updated your account!`] });
                    }else{
                        res.status(200).json({flag:false, message:[`Failed to update your account. Please try again.`] });
                    }
                }else{
                    res.status(200).json({flag,message});
                }
            }            
            catch(error){
                console.log(error);
                res.sendStatus(500);
            }
        }else{
            res.status(200).json({ flag,message });
        }
    // }) 
});

router.post('/activate', passport.authenticate('jwt', {session: false}), async (req,res) =>{
    flag = true;
    message = [];
    let {
        id
    } = req.body
    console.log(id);
    if (!isNumOnly(id)) {
        flag = false;
        message.push("ID must be a number.")
    }
    if(flag){
        try{
            let resUpdateStatus = await runPreparedQuery(activateUser,
                {
                    id
                }
            );
            if(resUpdateStatus.rowsAffected > 0){
                res.status(200).json({ flag: true, message:[`Account has been activated!`] });
            }else{
                res.status(200).json({flag:false, message:[`Failed to update status. Please try again.`] });
            }
        }            
        catch(error){
            console.log(error);
            res.sendStatus(500);
        }
    }else{
        res.status(200).json({ flag,message });
    }

});

router.post('/deactivate', passport.authenticate('jwt', {session: false}), async (req,res) =>{
    flag = true;
    message = [];
    let {
        id
    } = req.body

    if (isNumOnly(id)) {
        flag = false;
        message.push("ID must be a number.")
    }
    if(flag){
        try{
            let resUpdateStatus = await runPreparedQuery(deactivateUser,
                {
                    id
                }
            );
            if(resUpdateStatus.rowsAffected > 0){
                res.status(200).json({ flag: true, message:[`Account has been deactivated!`] });
            }else{
                res.status(200).json({flag:false, message:[`Failed to update status. Please try again.`] });
            }
        }            
        catch(error){
            console.log(error);
            res.sendStatus(500);
        }
    }else{
        res.status(200).json({ flag,message });
    }

});

router.post('/ban', passport.authenticate('jwt', {session: false}), async (req,res) =>{
    flag = true;
    message = [];
    let {
        id
    } = req.body

    if (!isNumOnly(id)) {
        flag = false;
        message.push("ID must be a number.")
    }
    if(flag){
        try{
            let resUpdateStatus = await runPreparedQuery(banUser,
                {
                    id
                }
            );
            if(resUpdateStatus.rowsAffected > 0){
                res.status(200).json({ flag: true, message:[`Account has been banned!`] });
            }else{
                res.status(200).json({flag:false, message:[`Failed to update status. Please try again.`] });
            }
        }            
        catch(error){
            console.log(error);
            res.sendStatus(500);
        }
    }else{
        res.status(200).json({ flag,message });
    }

});

router.post('/delete', passport.authenticate('jwt', {session: false}), async (req,res) =>{
    flag = true;
    message = [];
    let {
        id
    } = req.body

    if (isNumOnly(id)) {
        flag = false;
        message.push("ID must be a number.")
    }
    if(flag){
        try{
            let resUpdateStatus = await runPreparedQuery(deleteUser,
                {
                    id
                }
            );
            if(resUpdateStatus.rowsAffected > 0){
                res.status(200).json({ flag: true, message:[`Account has been deleted!`] });
            }else{
                res.status(200).json({flag:false, message:[`Failed to update status. Please try again.`] });
            }
        }            
        catch(error){
            console.log(error);
            res.sendStatus(500);
        }
    }else{
        res.status(200).json({ flag,message });
    }

});

module.exports = router;