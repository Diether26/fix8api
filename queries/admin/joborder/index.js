const getJoborders = `SELECT jo.id, jo.ServiceName, jo.JobType, jo.Description, jo.ContactNumber, jo.Location, jo.AppointmentDate,
   [latest_activity_status] = (
      SELECT TOP 1 jos.Status 
      FROM FIX8.dbo.JOB_ORDER_ACTIVITY joa
      LEFT OUTER JOIN FIX8.dbo.JOB_ORDER_STATUS jos ON joa.Status = jos.Id
      WHERE joa.JobOrderId = jo.Id
      ORDER BY joa.ActionDate DESC
   ),
   [latest_activity_date] = (
   SELECT TOP 1 (convert(varchar(10), joa.ActionDate, 120)) 
   FROM FIX8.dbo.JOB_ORDER_ACTIVITY joa
   WHERE joa.JobOrderId = jo.Id
   ORDER BY joa.ActionDate DESC
   )
   , [Requested_To] = (SELECT Lastname + ', ' + Firstname + ' ' + Middlename  
         FROM FIX8.dbo.USERS 
         WHERE Id = jo.RequestedTo
         ),
   [Requested_By] = (SELECT Lastname + ', ' + Firstname + ' ' + Middlename  
         FROM FIX8.dbo.USERS 
         WHERE Id = jo.RequestedBy
         )
   FROM FIX8.dbo.JOB_ORDER jo
   ORDER BY [latest_activity_date] DESC`;

 module.exports = {
    getJoborders

 }  