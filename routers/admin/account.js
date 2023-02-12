const express = require('express');
const formidable = require('formidable');
const fs = require('fs');
const passport = require('passport');
const { runPreparedQuery } = require('../../database');
const { checkPassword, changePassword, updateAdminAccount, updateAvatar } = require('../../queries/admin/account');
const { getUserByEmail } = require('../../queries/admin/auth');
const { isCharNumOnly, isValidMinLength, isValidMaxLength, isCharAndSpaceOnly, isValidEmail, isValidPhoneNumber, isValidDate, isCharOnly } = require('../../utils/validation');
const router = express.Router();

router.post('/update-account', passport.authenticate('jwt', {session: false}), async (req,res) => {
    // var form = new formidable.IncomingForm();
    // form.parse(req,async(err,fields) =>{
        let flag = true;
        let message = [];
        let{
            Firstname,
            Middlename,
            Lastname,
            Email,
            ContactNumber,
            Birthdate,
            Sex,
            Address,
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
        if (!isValidPhoneNumber(ContactNumber)) {
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
        // if (files.Avatar) {
        //     if (files.Avatar.size == 0) {
        //         flag = false;
        //         message.push("Cannot read your profile picture. Please try another one.")
        //     }
        //     if (files.Avatar.size > 0) {
        //         if (files.Avatar && !files.Avatar.type.match(/(jpg|jpeg|png)$/i)) {
        //             flag = false;
        //             message.push("Profile picture file type must be .jpg, .jpeg, and .png only.")
        //         }
        //     }
        // }
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
                    let resUpdateAdmin = await runPreparedQuery(updateAdminAccount,
                        {
                            Firstname,
                            Middlename,
                            Lastname,
                            Email,
                            ContactNumber,
                            Birthdate:bDate,
                            Sex,
                            Address,
                            id:req.user.Id
                        }
                    );
                    if(resUpdateAdmin.rowsAffected > 0){
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

router.post('/change-password', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let flag = true;
    let message = [];
    let { oldpassword, newpassword, confirmpassword } = req.body;

    //validation
   
    //old password validation
    if (isCharNumOnly(oldpassword)) {
        flag = false;
        message.push("Old password must contain at least 1 special characters.");
    }
    if(!isValidMinLength(oldpassword)){
        flag = false;
        message.push("Old password must be minimum of 6 characters only.");
    }
    if(!isValidMaxLength(oldpassword)){
        flag = false;
        message.push("Old password must be maximum of 12 characters only.");
    }

    //new password validation
    if(isCharNumOnly(newpassword)){
        flag = false;
        message.push("New password must contain at least 1 special characters.");
    }
    if(!isValidMinLength(newpassword)){
        flag = false;
        message.push("New password must be minimum of 6 characters only.");
    }
    if(!isValidMaxLength(newpassword)){
        flag = false;
        message.push("New password must be maximum of 12 characters only.");
    }

    //confirm password validation
    if(isCharNumOnly(confirmpassword)){
        flag = false;
        message.push("Confirm password must contain at least 1 special characters.");
    }
    if(!isValidMinLength(confirmpassword)){
        flag = false;
        message.push("Confirm password must be minimum of 6 characters only.");
    }
    if(!isValidMaxLength(confirmpassword)){
        flag = false;
        message.push("Confirm password must be maximum of 12 characters only.");
    }
    
    if(newpassword !== confirmpassword){
        flag = false;
        message.push("Password not match.");
    }
    if (newpassword === oldpassword) {
        flag = false;
        message.push("New password must not be equal to Old password.");
    }
    //end validation

    //success 
    if (flag) {
        try {
            let resCheckPassword = await runPreparedQuery(checkPassword, { id: req.user.Id, password: oldpassword });    
            console.log(resCheckPassword)        
            if (resCheckPassword.recordset.length > 0) {
                if (resCheckPassword.recordset[0].Password === oldpassword) {
                    let resChangePassword = await runPreparedQuery(changePassword, { id: req.user.Id, password: newpassword });
                    if (resChangePassword.rowsAffected > 0) {
                        res.status(200).json({ flag: true, message: [`You have successfully changed your password.`] });
                    } else {
                        res.status(200).json({ flag: false, message: [`Unable to change password. Please try again.`] });
                    }
                } else {
                    res.status(200).json({ flag: false, message: [`Invalid old password.Please try again.`] });
                }
            } else {
                res.status(200).json({ flag: false, message: [`Invalid old password.Please try again.`] });
            }            
        } catch (error) {
            console.log(error)
            res.sendStatus(500);
        }
    } else {
        res.status(200).json({ flag, message });
    }
});

router.post('/update-avatar', passport.authenticate('jwt', { session: false }), async (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        let flag = true;
        let message = [];
        //#region field validation
        if(!files.Avatar) {
            flag = false;
            message.push("Cannot read your profile picture. Please try another one.")
        }
        if (files.Avatar) {
            if (files.Avatar.size == 0) {
                flag = false;
                message.push("Cannot read your profile picture. Please try another one.")
            }
            if (files.Avatar.size > 0) {
                if (files.Avatar && !files.Avatar.type.match(/(jpg|jpeg|png)$/i)) {
                    flag = false;
                    message.push("Profile picture file type must be .jpg, .jpeg, and .png only.")
                }
            }
        }
         //#endregion field validation
         
        if (flag) {
            var avatarFileName = req.user.Avatar;
            if (files.Avatar) {
                avatarFileName = makeRandomFilename(files.Avatar.name.length) + "." + getFileType(files.Avatar.type);
                var oldpath = files.Avatar.path; 
                var newpath = process.env.PUBLIC_FILES_PATH + 'images\/avatar\/' + avatarFileName;
                fs.rename(oldpath, newpath, async (err) => {
                    if (err) {
                        flag = false;
                        message.push("Failed to upload your profile picture! Please try again.");
                    }                                  
                });
            }             
            if (flag) {
                try {
                    let respUpdateAvatar = await runPreparedQuery(updateAvatar, 
                        { 
                            Avatar: avatarFileName,
                            id: req.user.Id
                        }
                    );
                    if (respUpdateAvatar.rowsAffected > 0) {
                        res.status(200).json({ flag: true, message: [ `Successfully change your profile picture!` ] });
                    } else {
                        res.status(200).json({ flag: false, message: [ `Failed to change your profile picture. Please try again later.` ] });
                    }
                } catch (error) {
                    console.log(error)
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