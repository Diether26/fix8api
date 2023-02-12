const top5Feedback = `SELECT TOP 5 [FeedbackId] = f.Id, f.JobId, f.Rate, [RateDesc] = fr.Description, f.Comment,
                    [FeedbackBy]= u.Lastname + ', ' + u.Firstname + ' ' + u.Middlename,
                    [Date] = (convert(varchar(10), f.Date, 120))
                    FROM FIX8.dbo.FEEDBACK f 
                    LEFT OUTER JOIN FIX8.dbo.USERS u ON f.SenderId = u.Id
                    LEFT OUTER JOIN FIX8.dbo.FEEDBACK_RATING fr ON f.Rate = fr.Id
                    WHERE f.ReceiverId = @id
                    ORDER BY f.Date DESC`;
const feedbackCount = "SELECT [FeedbackCount] = COUNT (*) FROM FIX8.dbo.FEEDBACK f WHERE f.ReceiverId = @id";
const getAllFeedback = `SELECT [FeedbackId] = f.Id, f.JobId, f.Rate, [RateDesc] = fr.Description, f.Comment,
                    [FeedbackBy]= u.Lastname + ', ' + u.Firstname + ' ' + u.Middlename,
                    [Date] = (convert(varchar(10), f.Date, 120))
                    FROM FIX8.dbo.FEEDBACK f 
                    LEFT OUTER JOIN FIX8.dbo.USERS u ON f.SenderId = u.Id
                    LEFT OUTER JOIN FIX8.dbo.FEEDBACK_RATING fr ON f.Rate = fr.Id
                    WHERE f.ReceiverId = @id
                    ORDER BY f.Date DESC`;

module.exports = {
    top5Feedback,
    feedbackCount,
    getAllFeedback
}