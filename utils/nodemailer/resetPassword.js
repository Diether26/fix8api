const nodemailer = require('nodemailer');
const ejs = require('ejs');
const fs = require('fs');

const sendEmailNewPassword = (receiver, new_password) => {
    return new Promise((resolve, reject) => {
        // 0) Get the email template
        const template = fs.readFileSync(process.env.PUBLIC_FILES_PATH + 'email-template\/' + process.env.SMTP_EMAIL_RESETPASSWORD_TEMPLATE,{encoding:'utf-8'});
        let html = ejs.render(template, {new_password: new_password});
        // 1) Create a Transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // 2) Define the Email Options
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: receiver,
            subject: `[DO NOT REPLY] FIX8 RESET PASSWORD`,
            html: html
        };
        
        // 3) Now send email
        transporter.sendMail(mailOptions).then(async (response) => {
            if(response.accepted.length > 0) {
                resolve(true);
            } else {
                resolve(false);
            }
        })
        .catch((err) => {
            resolve(false);
        });   
    })  
}

module.exports = {
    sendEmailNewPassword
}