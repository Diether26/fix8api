const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

const { isCharNumOnly, isValidMinLength, isValidMaxLength, isValidEmail } = require('../../utils/validation');
const { runPreparedQuery } = require('../../database');
const { authUser, insertUserLog, checkEmail, changePasswordByEmail } = require('../../queries/common');
const { sendEmailNewPassword } = require('../../utils/nodemailer/resetPassword');

const generateJwtToken = (data) => {
    const signature = process.env.JWT_SECRET;

    const token = jwt.sign(data, signature, {
        expiresIn: '24h'
    });

    return token;
}

router.post('/', async (req, res) => {
    let flag = true;
    let message = [];
    let {
        Username,
        Password
    } = req.body;

    //#region field validation
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
    //#endregion field validation

    if (flag) {
        try {
            let resAuthUser = await runPreparedQuery(authUser, { username: Username, password: Password });
            if ( resAuthUser.recordset.length > 0) {
                let { _Password, ...rest } = resAuthUser.recordset[0];
                if (Password === resAuthUser.recordset[0].Password && Username === resAuthUser.recordset[0].Username) {
                    if (rest.Status == 1) {
                        let resInsertLog = await runPreparedQuery(insertUserLog, { uid: rest.Id, action: 'SIGN IN' });
                        if (resInsertLog.rowsAffected > 0) {
                            let token = generateJwtToken(rest);
                            let Usertype = rest.Usertype;
                            res.status(200).json({ flag: true, message: [ `Successfully logged in as ${rest.Username}!` ], token, Usertype});
                        } else {
                            res.status(200).json(
                                { 
                                    flag: false, 
                                    message: [ `Something went wrong! Please try again later.` ] 
                                }
                            );
                        }
                    }
                    if (rest.Status == 2) {
                        res.status(200).json(
                            { 
                                flag: false, 
                                message: [ `Successfully logged in as ${rest.Username}, but it seems to be inactive. Please contact administrator to activate your account.` ] 
                            }
                        );
                    }
                    if (rest.Status == 3) {
                        res.status(200).json(
                            { 
                                flag: false, 
                                message: [ `Your account has been banned from using this application. Please contact administrator for more info.` ] 
                            }
                        );
                    }
                    if (rest.Status == 4) {
                        res.status(200).json(
                            { 
                                flag: false, 
                                message: [ `This account has already been deleted. Please create new account to continue using this application.` ] 
                            }
                        );
                    }
                } else {
                    res.status(200).json(
                        { 
                            flag: false, 
                            message: [ `Unable to find your account. Please try again.` ] 
                        }
                    );
                }
            } else {
                res.status(200).json({ flag: false, message: [ `Unable to find your account. Please try again.` ] });
            }
        } catch (error) {
            console.log(error)
            res.sendStatus(500);
        }  
    } else {
        res.status(200).json({ flag, message });
    }    
});

router.get('/logout', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        let resInsertLog = await runPreparedQuery(insertUserLog, { uid: req.user.Id, action: 'SIGN OUT' });
        if (resInsertLog.rowsAffected > 0) {
            res.status(200).json({ flag: true, message: [`You have successfully logged out.`] });
        } else {
            res.status(200).json(
                { 
                    flag: false, 
                    message: [ `Something went wrong! Please try again later.` ] 
                }
            );
        }
    } catch (error) {
        console.log(error)
        res.sendStatus(500);
    }   
});

router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { Password, ...userData } = req.user;
    res.status(200).json({ flag: true, userData });
})

router.get('/refresh-token', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { Password, ...userData } = req.user;
    let token = generateJwtToken(userData);
    res.status(200).json({ flag: true, token });
})

router.post('/reset-password', async (req, res) => {
    let flag = true;
    let message = [];
    let { email } = req.body;  
    
    if (!isValidEmail(email)) {
        flag = false;
        message.push("Invalid email address.");
    } 

    if (flag) {
        try {
            const checkUser = await runPreparedQuery(checkEmail, { email });
            if(checkUser.recordset[0].Count > 0) {
                let randPassword = Array(10).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz").map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join(''); 
                let result = await runPreparedQuery(changePasswordByEmail, { email, password: randPassword+="!" });
                if(result.rowsAffected > 0) {
                    let sendmail = await sendEmailNewPassword(email,randPassword);
                    if(sendmail) {
                        res.status(200).json({ flag: true, message: "You have successfully resetted your password. Please check your email." });
                    } else {
                        res.status(200).json({ flag: false, message: "Something went wrong, please try later" });
                    }
                } else {
                    res.status(200).json({ flag: false, message: "Something went wrong, please try later" });
                }              
            } else {
                res.status(200).json({ flag: false, message: "Email does not exist! Please try again." });
            }     
        } catch (err) {
            console.log(err)
            res.sendStatus(500);
        }
    } else {
        res.status(200).json({ flag, message });
    }    
});

module.exports = router;