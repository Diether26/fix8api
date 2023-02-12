const getJOContractList = `SELECT joc.Id, joc.ContractFile, joc.JobOrderId, jo.ServiceName,jo.JobType,jo.ContactNumber, [RequestedBy] = u.Lastname + ', ' + u.Firstname + ' ' + u.Middlename, joc.DateRequested
FROM  FIX8.dbo.JOB_ORDER_CONTRACT joc
LEFT OUTER JOIN FIX8.dbo.JOB_ORDER jo ON joc.JobOrderId = jo.Id
LEFT OUTER JOIN FIX8.dbo.USERS u ON jo.RequestedTo = u.Id`;
const getJOContractById = `SELECT * FROM FIX8.dbo.JOB_ORDER_CONTRACT joc WHERE joc.Id = @id`;
const updateContractFile = `UPDATE FIX8.dbo.JOB_ORDER_CONTRACT SET ContractFile = @contractFileName WHERE Id = @id`;

module.exports = {
    getJOContractList,
    getJOContractById,
    updateContractFile
}