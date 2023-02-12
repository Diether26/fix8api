const getCountJORequestedStatus = `
with CTE as (
SELECT jo.id, jo.ServiceName, jo.JobType, jo.Description, jo.ContactNumber, jo.Location, jo.AppointmentDate,
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
)

select COUNT(*) as [Count] from CTE i 
WHERE 
i.latest_activity_status = 'Requested' AND
i.latest_activity_date between @from_date AND @to_date 
`;

const getCountJOAcceptedStatus = `
with CTE as (
SELECT jo.id, jo.ServiceName, jo.JobType, jo.Description, jo.ContactNumber, jo.Location, jo.AppointmentDate,
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
)

select COUNT(*) as [Count] from CTE i 
WHERE 
i.latest_activity_status = 'Accepted' AND
i.latest_activity_date between @from_date AND @to_date 
`;

const getCountJOInProgressStatus = `
with CTE as (
SELECT jo.id, jo.ServiceName, jo.JobType, jo.Description, jo.ContactNumber, jo.Location, jo.AppointmentDate,
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
)

select COUNT(*) as [Count] from CTE i 
WHERE 
i.latest_activity_status = 'In Progress' AND
i.latest_activity_date between @from_date AND @to_date 
`;

const getCountJORejectedStatus = `
with CTE as (
SELECT jo.id, jo.ServiceName, jo.JobType, jo.Description, jo.ContactNumber, jo.Location, jo.AppointmentDate,
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
)

select COUNT(*) as [Count] from CTE i 
WHERE 
i.latest_activity_status = 'Rejected' AND
i.latest_activity_date between @from_date AND @to_date 
`;

const getCountJOCancelledStatus = `
with CTE as (
SELECT jo.id, jo.ServiceName, jo.JobType, jo.Description, jo.ContactNumber, jo.Location, jo.AppointmentDate,
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
)

select COUNT(*) as [Count] from CTE i 
WHERE 
i.latest_activity_status = 'Cancelled' AND
i.latest_activity_date between @from_date AND @to_date 
`;

const getCountJODoneStatus = `
with CTE as (
SELECT jo.id, jo.ServiceName, jo.JobType, jo.Description, jo.ContactNumber, jo.Location, jo.AppointmentDate,
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
)

select COUNT(*) as [Count] from CTE i 
WHERE 
i.latest_activity_status = 'Done' AND
i.latest_activity_date between @from_date AND @to_date 
`;

const getCountJOCompletedStatus = `
with CTE as (
SELECT jo.id, jo.ServiceName, jo.JobType, jo.Description, jo.ContactNumber, jo.Location, jo.AppointmentDate,
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
)

select COUNT(*) as [Count] from CTE i 
WHERE 
i.latest_activity_status = 'Completed' AND
i.latest_activity_date between @from_date AND @to_date 
`;

const getPremiumUsers = `SELECT COUNT(*) AS [Count] FROM FIX8.dbo.USERS u 
RIGHT OUTER JOIN FIX8.dbo.SUBSCRIPTION s ON u.Id = s.UserID`;

const getCountAllUsers = `SELECT COUNT(*) AS [Count] FROM FIX8.dbo.USERS`;

const getCountRequestContract = `SELECT COUNT(*) AS [Count] FROM FIX8.dbo.JOB_ORDER_CONTRACT`;

module.exports = {
    getCountJORequestedStatus,
    getCountJOAcceptedStatus,
    getCountJOInProgressStatus,
    getCountJORejectedStatus,
    getCountJOCancelledStatus,
    getCountJODoneStatus,
    getCountJOCompletedStatus,
    getPremiumUsers,
    getCountAllUsers,
    getCountRequestContract
}