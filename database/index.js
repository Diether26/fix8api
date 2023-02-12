require('dotenv').config();

const sql = require('mssql');

const config = {
    server: process.env.DB_SERVER,
    authentication: { type: 'default', options: { userName: process.env.DB_USER, password: process.env.DB_PASS } },
    options: {
        enableArithAbort: true,
        cryptoCredentialsDetails: {
            minVersion: 'TLSv1'
        }
    },
    connectionTimeout: 500000,
    requestTimeout: 20000,
    pool: {
        idleTimeoutMillis: 300000,
        max: 100
    }
}

//with T-SQL
let pool = sql.ConnectionPool;
let transaction = sql.Transaction;
const statements = sql.PreparedStatement[transaction] =[]

//non T-SQL
const poolPromise = sql.connect(config);

const transformDataType = (type) => {
    switch(type) {
        case "string": return sql.VarChar(sql.MAX);
        default: return sql.Int;
    }
}

const connect = async()=>{
    pool = new sql.ConnectionPool(config)
    await pool.connect()
}

const disconnect = async()=>{
    if (typeof pool == 'undefined') return
    if (pool.connected) await pool.close()
}

const begin = async()=>{
    transaction = new sql.Transaction(pool)
    await transaction.begin()
}

const unprepare  = async(statement = sql.PreparedStatement)=>{
    if (typeof statement == 'undefined') return
    if (statement.prepared) await statement.unprepare()
}

const commit = async()=>{
    await transaction.commit()
}

const rollback = async()=>{
    for (const statement of statements) {
        await unprepare(statement)
    }
    if (typeof transaction == 'undefined') return
    await transaction.rollback()
}

const createStatement = ()=>{
    let statement = new sql.PreparedStatement(transaction)
    statements.push(statement)
    return statement
}

const runPreparedQueryTSQL = async (query, args) => {
    let prepQuery = new sql.PreparedStatement(transaction);
    statements.push(prepQuery);
    Object.keys(args).forEach(arg => {
        prepQuery.input(arg, transformDataType(typeof args[arg]));
    })
    await prepQuery.prepare(query);
    let result = await prepQuery.execute({ ...args });
    await prepQuery.unprepare();

    return result;
}

const runQuery = (query) => poolPromise.then(() => sql.query(query));

const runPreparedQuery = async (query, args) => {
    let pool = await poolPromise;
    let prepQuery = new sql.PreparedStatement(pool);
    Object.keys(args).forEach(arg => {
        prepQuery.input(arg, transformDataType(typeof args[arg]));
    })
    await prepQuery.prepare(query);
    let result = await prepQuery.execute({ ...args });
    await prepQuery.unprepare();

    return result;
}

const fetchQuery = (query) => async (req, res) => {
    try {
        let resp = await runQuery(query);
        res.status(200).json(resp.recordset);
    } catch(err) {
        console.log(err)
        res.sendStatus(500)
    }
}

process.on("beforeExit", () => {
    poolPromise.then(() => sql.close());
})

module.exports = {
    runQuery,
    runPreparedQuery,
    fetchQuery,
    runPreparedQueryTSQL,
    connect,
    disconnect,
    begin,
    unprepare,
    commit,
    createStatement,
    rollback
}