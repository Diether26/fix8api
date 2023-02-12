const insertProgressReport = `INSERT INTO FIX8.dbo.PROGRESS_REPORT(JobOrderId, Remarks, Date) VALUES(@id, @remarks, GETUTCDATE())`;
const getPRJOA = `
DROP TABLE IF EXISTS #pr_joa;
WITH cte AS (
SELECT Type = 'JOA', Remarks, ActionById = joa.ActionBy, 
ActionByName = u.Lastname + ', ' + u.Firstname + ' ' + u.Middlename, 
Date = convert(varchar(10), joa.ActionDate, 120) 
FROM FIX8.dbo.JOB_ORDER_ACTIVITY joa 
LEFT OUTER JOIN FIX8.dbo.USERS u ON joa.ActionBy = u.Id
WHERE joa.JobOrderId = @id
UNION ALL
SELECT Type = 'PR', Remarks = pr.Remarks, ActionById = jo.RequestedTo, 
ActionByName = u.Lastname + ', ' + u.Firstname + ' ' + u.Middlename, 
Date = convert(varchar(10), pr.Date, 120)
FROM FIX8.dbo.PROGRESS_REPORT pr
LEFT OUTER JOIN FIX8.dbo.JOB_ORDER jo ON pr.JobOrderId = jo.Id
LEFT OUTER JOIN FIX8.dbo.USERS u ON jo.RequestedTo = u.Id
WHERE pr.JobOrderId = @id) 
SELECT * INTO #pr_joa FROM cte

SELECT * FROM #pr_joa ORDER BY Date ASC`;

module.exports = {
    insertProgressReport,
    getPRJOA
}