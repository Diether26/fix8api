const sendMessage = `INSERT INTO FIX8.dbo.CONVERSATION (JobId, Content, SenderId, Date)
VALUES(@Id, @Content, @SenderId, GETUTCDATE())`;
const getMessages = 'SELECT * FROM FIX8.dbo.CONVERSATION c WHERE c.JobId = @id AND c.Id > @last_id ORDER BY c.Date ASC';
const getJobOrderById = `SELECT [latest_activity_date] = (
    SELECT TOP 1 (convert(varchar(10), joa.ActionDate, 120)) 
    FROM FIX8.dbo.JOB_ORDER_ACTIVITY joa
    WHERE joa.JobOrderId = jo.Id
    ORDER BY joa.ActionDate DESC
),
[latest_activity_status] = (
    SELECT TOP 1 jos.Status 
    FROM FIX8.dbo.JOB_ORDER_ACTIVITY joa
    LEFT OUTER JOIN FIX8.dbo.JOB_ORDER_STATUS jos ON joa.Status = jos.Id
    WHERE joa.JobOrderId = jo.Id
    ORDER BY joa.ActionDate DESC
)
, jo.* 
FROM FIX8.dbo.JOB_ORDER jo
WHERE jo.Id = @id AND (jo.RequestedBy = @uid OR jo.RequestedTo = @uid)
ORDER BY [latest_activity_date] DESC`;

module.exports = {
    sendMessage,
    getMessages,
    getJobOrderById
}