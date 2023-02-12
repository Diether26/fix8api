require('dotenv').config();
const express = require('express');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const router = express.Router();
const { runPreparedQuery } = require('../database/index');
const { getUser } = require('../queries/common');
let baseUrl = null;
const extractToken = function(req) {
    baseUrl = req.baseUrl;
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        return req.query.token;
    }
    else{
        return null;
    }
}

const jwtOptions = {
    jwtFromRequest: extractToken,
    secretOrKey: process.env.JWT_SECRET
}

passport.use(new JwtStrategy(jwtOptions, async function(jwt_payload, done) {
    try {
        let { Username } = jwt_payload;
        let isAdminRequest = baseUrl.includes('/api/admin/');
        let isHomeownerRequest = baseUrl.includes('/api/homeowner/');
        let isElectricianRequest = baseUrl.includes('/api/electrician/');
        let currUser = await runPreparedQuery(getUser, { Username });
        if (currUser.recordset.length > 0) {
            // return done(null, currUser.recordset[0]);
            if (isAdminRequest) {
                if(currUser.recordset[0].Usertype === "Administrator") {
                    return done(null, currUser.recordset[0]);
                } else {
                    return done(null, false);
                }
            } else if (isHomeownerRequest) {
                if(currUser.recordset[0].Usertype === "Homeowner") {
                    return done(null, currUser.recordset[0]);
                } else {
                    return done(null, false);
                }
            } else if (isElectricianRequest) {
                if(currUser.recordset[0].Usertype === "Electrician") {
                    return done(null, currUser.recordset[0]);
                } else {
                    return done(null, false);
                }
            } else {
                return done(null, currUser.recordset[0]);
            }
        } else {
            return done(null, false);
        }
    } catch(err) {
        return done(err, false);
    }
}))


module.exports = router;