const nodemailer = require('nodemailer');
const ejs = require('ejs');
const fs = require('fs');

const sendEmailInvoice = (JO_Details, InvoiceID, InvoiceDueDate, PaymentMethod, ServiceFee, AmountDue, Items, validItems, BankName, AccountNumber, AccountHolder, QrCode) => {
    return new Promise((resolve, reject) => {
        let _Items = [];
        for (let i = 0; i < validItems.length; i++) {
            _Items.push(Items[validItems[i]]);
        }
        // 0) Get the email template
        const template = fs.readFileSync(process.env.PUBLIC_FILES_PATH + 'email-template\/' + process.env.SMTP_EMAIL_INVOICE_TEMPLATE,{encoding:'utf-8'});
        let html = ejs.render(template, {
            ClientName: JO_Details.name,
            ClientAddress: JO_Details.Location,
            ClientContact: JO_Details.ContactNumber,
            InvoiceID,
            InvoiceDueDate: new Date(InvoiceDueDate).toDateString(),
            PaymentMethod,
            ServiceFee: parseFloat(ServiceFee).toFixed(2),
            AmountDue: parseFloat(AmountDue).toFixed(2),
            Currency: process.env.CURRENCY,
            CurrencySymbol: process.env.CURRENCY_SYMBOL,
            Items: _Items,
            BankName,
            AccountNumber,
            AccountHolder,
            QrCode
        });
        // let html = ejs.render(template);
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
            to: JO_Details.email,
            subject: process.env.SMTP_SUBJECT,
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
    sendEmailInvoice
}