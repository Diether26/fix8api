const getFeedbacks = `SELECT f.*, [RateDesc] = fr.Description,
[FeedbackTo] = (
SELECT [Fullname] = u.Lastname + ', ' + u.Firstname + ' ' + u.Middlename 
FROM FIX8.dbo.USERS u WHERE u.Id = f.ReceiverId
),
[FeedbackBy] = (
SELECT [Fullname] = u.Lastname + ', ' + u.Firstname + ' ' + u.Middlename 
FROM FIX8.dbo.USERS u WHERE u.Id = f.SenderId
)
FROM FIX8.dbo.FEEDBACK f
LEFT OUTER JOIN FIX8.dbo.FEEDBACK_RATING fr ON f.Rate = fr.Id`;

const getFeedbackById = `SELECT f.*, [RateDesc] = fr.Description,
[FeedbackTo] = (
SELECT [Fullname] = u.Lastname + ', ' + u.Firstname + ' ' + u.Middlename 
FROM FIX8.dbo.USERS u WHERE u.Id = f.ReceiverId
),
[FeedbackBy] = (
SELECT [Fullname] = u.Lastname + ', ' + u.Firstname + ' ' + u.Middlename 
FROM FIX8.dbo.USERS u WHERE u.Id = f.SenderId
)
FROM FIX8.dbo.FEEDBACK f
LEFT OUTER JOIN FIX8.dbo.FEEDBACK_RATING fr ON f.Rate = fr.Id
WHERE f.Id = @id`;

const deleteFeedback = `DELETE FROM FIX8.dbo.FEEDBACK WHERE Id = @id`;

module.exports = {
 getFeedbacks,
 getFeedbackById,
 deleteFeedback
}