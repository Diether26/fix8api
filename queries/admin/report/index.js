const getReportUsers = `SELECT
[ReportedUser] = (SELECT u.Lastname + ', ' + u.Firstname + ' ' + u.Middlename FROM FIX8.dbo.USERS u WHERE u.Id = ur.UserID),
[ReportedUserAccountStatus] = ( 
	SELECT u.Status
	FROM FIX8.dbo.USERS u 
	WHERE u.Id = ur.UserID 
),
[ReportedUserAccountStatusDesc] = ( 
	SELECT us.Status
	FROM FIX8.dbo.USERS u 
	LEFT OUTER JOIN FIX8.dbo.USER_STATUS us ON u.Status = us.Id
	WHERE u.Id = ur.UserID 
),
[ReportedByUser] = (SELECT u.Lastname + ', ' + u.Firstname + ' ' + u.Middlename FROM FIX8.dbo.USERS u WHERE u.Id = ur.ReportedBy),
 ur.*
FROM FIX8.dbo.USER_REPORTED ur`;

const getUserLogs = `SELECT ul.*, u.Lastname+', '+ u.Firstname +' ' + u.Middlename as FullName, u.Usertype FROM FIX8.dbo.USER_LOGS ul
LEFT OUTER JOIN FIX8.dbo.USERS u ON ul.UserId = u.Id`;

module.exports = {
    getReportUsers,
	getUserLogs
}