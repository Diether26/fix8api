const getUser = `SELECT
[hasSubscribed] = ISNULL( 
	(
		SELECT COUNT(*) FROM  FIX8.dbo.SUBSCRIPTION s 
		LEFT OUTER JOIN FIX8.dbo.PAYMENT p ON s.Id = p.SubscriptionID
		WHERE s.UserID = u.Id AND p.Status = 3
	)
,0),
* 
FROM FIX8.dbo.USERS u WHERE u.Username = @Username`;
const authUser = `SELECT
[hasSubscribed] = ISNULL( 
	(
		SELECT COUNT(*) FROM  FIX8.dbo.SUBSCRIPTION s 
		LEFT OUTER JOIN FIX8.dbo.PAYMENT p ON s.Id = p.SubscriptionID
		WHERE s.UserID = u.Id AND p.Status = 3
	)
,0),
* 
FROM FIX8.dbo.USERS u WHERE u.Username = @username and u.Password = @password`;
const updateUserPassword = "UPDATE FIX8.dbo.USERS SET Password = @password WHERE Id = @id";
const insertUserLog = "INSERT INTO FIX8.dbo.USER_LOGS VALUES(@uid,@action,GETUTCDATE())";
const checkEmail = "SELECT COUNT(*) AS Count FROM FIX8.dbo.USERS WHERE Email = @email";
const changePasswordByEmail = "UPDATE FIX8.dbo.USERS SET Password = @password WHERE Email = @email";
const getJOById = `SELECT * FROM FIX8.dbo.JOB_ORDER jo WHERE jo.Id = @id AND (jo.RequestedBy = @userid OR jo.RequestedTo = @userid)`;
const checkIfReportExist = `SELECT * FROM FIX8.dbo.USER_REPORTED ur WHERE ur.JobOrderID = @job_id AND ur.ReportedBy = @reportedby`;
const reportUser = `INSERT INTO FIX8.dbo.USER_REPORTED (JobOrderID, UserID, ReportedBy, DateReported)
VALUES(@job_id, @uid, @reportedby, GETUTCDATE())`;

module.exports = {
    getUser,
    authUser,
    updateUserPassword,
    insertUserLog,
	checkEmail,
	changePasswordByEmail,
	getJOById,
	checkIfReportExist,
	reportUser
}