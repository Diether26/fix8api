const createJobOrder = `INSERT INTO FIX8.dbo.JOB_ORDER 
(ServiceName,JobType,Description,ContactNumber,Location,BuildingPermit,Blueprint,AppointmentDate,RequestedTo,RequestedBy)
VALUES(@ServiceName,@JobType,@Description,@ContactNumber,@Location,@BuildingPermit,@Blueprint,@AppointmentDate,@RequestedTo,@RequestedBy);
SELECT SCOPE_IDENTITY() AS id`;
const createJOActivity = `INSERT INTO FIX8.dbo.JOB_ORDER_ACTIVITY (JobOrderId, Status, Remarks, ActionBy, ActionDate)
VALUES(@JobOrderId, @Status, @Remarks, @ActionBy, GETUTCDATE())`;
const getJobOrders = `SELECT [latest_activity_date] = (
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
, [name] = u.Lastname + ', ' + u.Firstname + ' ' + u.Middlename
, jo.* 
FROM FIX8.dbo.JOB_ORDER jo
LEFT OUTER JOIN FIX8.dbo.USERS u ON jo.RequestedTo = u.Id
WHERE jo.RequestedBy = @id
ORDER BY [latest_activity_date] DESC`;
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
, [name] = u.Lastname + ', ' + u.Firstname + ' ' + u.Middlename
, jo.* 
FROM FIX8.dbo.JOB_ORDER jo
LEFT OUTER JOIN FIX8.dbo.USERS u ON jo.RequestedTo = u.Id
WHERE jo.RequestedBy = @uid AND jo.Id = @id
ORDER BY [latest_activity_date] DESC`;

module.exports = {
    createJobOrder,
    createJOActivity,
    getJobOrders,
    getJobOrderById
}