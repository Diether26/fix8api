require('dotenv').config();
require('./routers/passport');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const passport = require('passport');
const compression = require('compression');
const app = express();

/** COMMON ROUTERS */
const cAuthRouter = require('./routers/common/auth');
const cMessageRouter = require('./routers/common/message');
const cReportUserRouter = require('./routers/common/report-user');

/** HOMEOWNER ROUTERS **/
const hoAuthRouter = require('./routers/homeowner/auth');
const hoMainRouter = require('./routers/homeowner/main');
const hoAccountRouter = require('./routers/homeowner/account');
const hoJobOrderRouter = require('./routers/homeowner/joborder');
const hoFeedbackRouter = require('./routers/homeowner/feedback');
const hoProgressRouter = require('./routers/homeowner/progress');
const hoReportRouter = require('./routers/homeowner/report');

/** ELECTRICIAN ROUTERS **/
const elAuthRouter = require('./routers/electrician/auth');
const elAccountRouter = require('./routers/electrician/account');
const elFeedbackRouter = require('./routers/electrician/feedback');
const elJobOrderRouter = require('./routers/electrician/joborder');
const elProgressRouter = require('./routers/electrician/progress');
const elSubscriptionRouter = require('./routers/electrician/subscription');
const elReportRouter = require('./routers/electrician/report');


/** ADMIN ROUTERS **/
const admAuthRouter = require('./routers/admin/auth');
const admAccountRouter = require('./routers/admin/account');
const admSubscriptionRouter = require('./routers/admin/subscription');
const admReportedUserRouter = require('./routers/admin/report');
const admUserRouter = require('./routers/admin/user');
const admJobOrderRouter = require('./routers/admin/joborder');
const admInvoiceRouter = require('./routers/admin/invoice');
const admPaymentRouter = require('./routers/admin/payment');
const admContractRouter = require('./routers/admin/contract');
const admFeedbackRouter = require('./routers/admin/feedback');
const admDashboardRouter = require('./routers/admin/dashboard');

app.use(compression());
app.use(express.static('public'));
app.use(cors({ credentials: true, origin: process.env.ALLOWED_ORIGINS }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
      rolling: true, // forces resetting of max age
      cookie: {
        maxAge: 360000,
        secure: false // this should be true only when you don't want to show it for security reason
      }
    })
);
app.use(passport.initialize());
app.use(passport.session());

/** COMMON API PATH */
app.use('/api/common/auth', cAuthRouter);
app.use('/api/common/message', cMessageRouter);
app.use('/api/common/report-user', cReportUserRouter);

/** HOMEOWNER API PATH */
app.use('/api/homeowner/auth', hoAuthRouter);
app.use('/api/homeowner/main', hoMainRouter);
app.use('/api/homeowner/account', hoAccountRouter);
app.use('/api/homeowner/joborder', hoJobOrderRouter);
app.use('/api/homeowner/feedback', hoFeedbackRouter);
app.use('/api/homeowner/progress', hoProgressRouter);
app.use('/api/homeowner/report', hoReportRouter);

/** ELECTRICIAN API PATH **/
app.use('/api/electrician/auth', elAuthRouter);
app.use('/api/electrician/account', elAccountRouter);
app.use('/api/electrician/feedback', elFeedbackRouter);
app.use('/api/electrician/joborder', elJobOrderRouter);
app.use('/api/electrician/progress', elProgressRouter);
app.use('/api/electrician/subscription', elSubscriptionRouter);
app.use('/api/electrician/report', elReportRouter);

/** ADMIN API PATH **/
app.use('/api/admin/auth', admAuthRouter);
app.use('/api/admin/account', admAccountRouter);
app.use('/api/admin/subscription', admSubscriptionRouter);
app.use('/api/admin/report', admReportedUserRouter);
app.use('/api/admin/user', admUserRouter);
app.use('/api/admin/joborder',admJobOrderRouter);
app.use('/api/admin/invoice',admInvoiceRouter);
app.use('/api/admin/payment',admPaymentRouter);
app.use('/api/admin/joborder', admJobOrderRouter);
app.use('/api/admin/invoice', admInvoiceRouter);
app.use('/api/admin/contract', admContractRouter);
app.use('/api/admin/feedback', admFeedbackRouter);
app.use('/api/admin/dashboard', admDashboardRouter);

async function start() {
    try {
        app.listen(process.env.HTTP_PORT, () => {
            console.log(`Connected to port: ${process.env.HTTP_PORT}`)
        })
    } catch(err) {
        console.log(err);
    }
}

start();