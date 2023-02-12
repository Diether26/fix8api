const express = require('express');
const passport = require('passport');
const { fetchQuery, runPreparedQuery } = require('../../database');
const { getJOContractList, getJOContractById, updateContractFile } = require('../../queries/admin/contract');
const { isNumOnly } = require('../../utils/validation');
var formidable = require('formidable');
var fs = require('fs');
const router = express.Router();

router.get('/', passport.authenticate('jwt', {session: false}), fetchQuery(getJOContractList));


router.post('/upload', passport.authenticate('jwt', { session: false }), async (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        let flag = true;
        let message = [];
        let { id } = fields;
        //#region field validation
        if (!isNumOnly(id)) {
            flag = false;
            message.push("Invalid ID detected, please try again.");
        }
        if (!files.Contract) {
            flag = false;
            message.push("Please upload contract file.");
        }
        if (files.Contract) {
            if (files.Contract.size == 0) {
                flag = false;
                message.push("Cannot read your contract file Please try another one.")
            }
            if (files.Contract.size > 0) {
                if (files.Contract && !files.Contract.type.match(/(pdf)$/i)) {
                    flag = false;
                    message.push("Contract file type must be .pdf only.")
                }
            }
        }
         //#endregion field validation
         
        if (flag) {
            let contractFileName = "";
            if (files.Contract) {
                contractFileName = makeRandomFilename(files.Contract.name.length) + "." + getFileType(files.Contract.type);
                var oldpath = files.Contract.path; 
                var newpath = process.env.PUBLIC_FILES_PATH + 'joborder\/contracts\/' + contractFileName;
                fs.rename(oldpath, newpath, async (err) => {
                    if (err) {
                        flag = false;
                        message.push("Failed to upload contract! Please try again.");
                    }                                  
                });
            }             
            if (flag) {
                try {
                    let resGetJOContract = await runPreparedQuery(getJOContractById, { id });
                    if (resGetJOContract.recordset.length > 0) {
                        let resUpdateContract = await runPreparedQuery(updateContractFile, {
                            id,
                            contractFileName
                        });
                        if (resUpdateContract.rowsAffected > 0) {
                            res.status(200).json({ flag: true, message: [ `You have successfully uploaded a new contract.` ] });
                        } else {
                            res.status(200).json({ flag: false, message: [ `Failed to save contract file. Please try again later.` ] });
                        }
                    } else {
                        res.status(200).json({ flag: false, message: [ `Unabled to find contract.` ] });
                    }
                } catch (error) {
                    console.log(error);
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