const express = require('express');
const passport = require('passport');
const router = express.Router();
var formidable = require('formidable');
var fs = require('fs');

const { isValidEmail, isCharNumOnly, isNumOnly, isCharOnly, isValidDate, isValidMinLength, isValidMaxLength, isCharAndSpaceOnly, isValidPhoneNumber } = require('../../utils/validation');
const { runPreparedQuery } = require('../../database');
const { getUserByEmail, getUserByUsername, insertElectrician } = require('../../queries/electrician/auth');

router.post('/register', async (req, res) => {
   var form = new formidable.IncomingForm();
   form.parse(req, async (err, fields, files) => {
        let flag = true;
        let message = [];
        let {
            Firstname,
            Middlename,
            Lastname,
            Email,
            ContactNumber,
            Address,
            Birthdate,
            Sex,
            Username,
            Password,
            Experience,
            Experties
        } = fields;
        
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
        if (!isCharNumOnly(Username)) {
            flag = false;
            message.push("Username must contain characters only.")
        }
        if (!isValidMinLength(Username)) {
            flag = false;
            message.push("Username must contain at least 6 characters.")
        }
        if (!isValidMaxLength(Username)) {
            flag = false;
            message.push("Username must contain not more than 12 characters")
        }
        if (isCharNumOnly(Password)) {
            flag = false;
            message.push("Password must contain at least 1 special characters.")
        }
        if (!isValidMinLength(Password)) {
            flag = false;
            message.push("Password must contain at least 6 characters.")
        }
        if (!isValidMaxLength(Password)) {
            flag = false;
            message.push("Password must contain not more than 12 characters.")
        }
        if (!files.Avatar) {
            flag = false;
            message.push("Profile picture is missing.")
        }
        if (files.Avatar) {
            if (files.Avatar.size == 0) {
                flag = false;
                message.push("Profile picture is missing.")
            }
            if (files.Avatar.size > 0) {
                if (files.Avatar && !files.Avatar.type.match(/(jpg|jpeg|png)$/i)) {
                    flag = false;
                    message.push("Profile picture file type must be .jpg, .jpeg, and .png only.")
                }
            }
        }
        if (!files.Resume) {
            flag = false;
            message.push("Resume is missing.")
        }
        if (files.Resume) {
            if (files.Resume.size == 0) {
                flag = false;
                message.push("Resume is missing.")
            }
            if (files.Resume.size > 0) {
                if (files.Resume && !files.Resume.type.match(/(docx|pdf)$/i)) {
                    flag = false;
                    message.push("Resume file type must be .docx, and .pdf only.")
                }
            }
        }
        if (files.Certificate) {
            if (files.Certificate.size == 0) {
                flag = false;
                message.push("Certificate uploaded is invalid.")
            }
            if (files.Certificate.size > 0) {
                if (files.Certificate && !files.Certificate.type.match(/(docx|pdf)$/i)) {
                    flag = false;
                    message.push("Certificate file type must be .docx, and .pdf only.")
                }
            }
        }
        if (Experties && Experties.length > 500) {
            flag = false;
            message.push("Experties length must be less than or equal to 500 characters.")
        }
        if (Experience && Experience.length > 500) {
            flag = false;
            message.push("Work Experience length must be less than or equal to 500 characters.")
        }
        //#endregion field validation
        
        if (flag) {
            var avatarFileName = makeRandomFilename(files.Avatar.name.length) + "." + getFileType(files.Avatar.type);
            var oldpath = files.Avatar.path; 
            var newpath = process.env.PUBLIC_FILES_PATH + 'images\/avatar\/' + avatarFileName;
            fs.rename(oldpath, newpath, async (err) => {
                if (err) {
                    res.status(200).json({ flag: false, message: [ `Failed to upload your profile picture! Please try again.` ] });
                }   
                else{
                    var resumeFileName = makeRandomFilename(files.Resume.name.length) + "." + getFileType(files.Resume.type);
                    var oldpath = files.Resume.path; 
                    var newpath = process.env.PUBLIC_FILES_PATH + 'attachments\/resume\/' + resumeFileName;
                    fs.rename(oldpath, newpath, async (err) => {
                        if (err) {
                            res.status(200).json({ flag: false, message: [ `Failed to upload your resume! Please try again.` ] });
                        }   
                        else{
                            if (files.Certificate) {
                                var certFileName = makeRandomFilename(files.Certificate.name.length) + "." + getFileType(files.Certificate.type);
                                var oldpath = files.Certificate.path; 
                                var newpath = process.env.PUBLIC_FILES_PATH + 'attachments\/certificate\/' + certFileName;
                                fs.rename(oldpath, newpath, async (err) => {
                                    if (err) {
                                        res.status(200).json({ flag: false, message: [ `Failed to upload your certificate! Please try again.` ] });
                                    }   
                                    else{
                                        try {
                                            let resGetUserByEmail = await runPreparedQuery(getUserByEmail, { email: Email });
                                            let resGetUserByUsername = await runPreparedQuery(getUserByUsername, { username: Username });
                                            if (resGetUserByEmail.rowsAffected > 0) {
                                                flag = false;
                                                message.push("Email is already in use.")
                                            }
                                            if( resGetUserByUsername.rowsAffected > 0) {
                                                flag = false;
                                                message.push("Username is already in use.")
                                            }
                                            if (flag) {
                                                let bDate = Birthdate ? new Date(Birthdate).toISOString().slice(0,10) : null;
                                                let respInsertElectrician = await runPreparedQuery(insertElectrician, 
                                                    { 
                                                        Firstname,
                                                        Middlename,
                                                        Lastname,
                                                        Email,
                                                        ContactNumber,
                                                        Address,
                                                        Birthdate: bDate,
                                                        Sex,
                                                        Username,
                                                        Password, 
                                                        Experties,
                                                        Experience,
                                                        Avatar: avatarFileName,
                                                        Resume: resumeFileName,
                                                        Certificate: certFileName
                                                    }
                                                );
                                                if (respInsertElectrician.rowsAffected > 0) {
                                                    res.status(200).json({ flag: true, message: [ `Successfully created an account!` ] });
                                                } else {
                                                    res.status(200).json({ flag: false, message: [ `Failed to create your account. Please try again later.` ] });
                                                }
                                            } else {
                                                res.status(200).json({ flag, message });
                                            }
                                        } catch (error) {
                                            console.log(error)
                                            res.sendStatus(500);
                                        }   
                                    }             
                                });
                            } else {
                                try {
                                    let resGetUserByEmail = await runPreparedQuery(getUserByEmail, { email: Email });
                                    let resGetUserByUsername = await runPreparedQuery(getUserByUsername, { username: Username });
                                    if (resGetUserByEmail.rowsAffected > 0) {
                                        flag = false;
                                        message.push("Email is already in use.")
                                    }
                                    if( resGetUserByUsername.rowsAffected > 0) {
                                        flag = false;
                                        message.push("Username is already in use.")
                                    }
                                    if (flag) {
                                        let bDate = Birthdate ? new Date(Birthdate).toISOString().slice(0,10) : null;
                                        let respInsertElectrician = await runPreparedQuery(insertElectrician, 
                                            { 
                                                Firstname,
                                                Middlename,
                                                Lastname,
                                                Email,
                                                ContactNumber,
                                                Address,
                                                Birthdate: bDate,
                                                Sex,
                                                Username,
                                                Password, 
                                                Experties,
                                                Experience,
                                                Avatar: avatarFileName,
                                                Resume: resumeFileName,
                                                Certificate: null
                                            }
                                        );
                                        if (respInsertElectrician.rowsAffected > 0) {
                                            res.status(200).json({ flag: true, message: [ `Successfully created an account!` ] });
                                        } else {
                                            res.status(200).json({ flag: false, message: [ `Failed to create your account. Please try again later.` ] });
                                        }
                                    } else {
                                        res.status(200).json({ flag, message });
                                    }
                                } catch (error) {
                                    console.log(error)
                                    res.sendStatus(500);
                                }  
                            }                            
                        }             
                    });
                }             
            });
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