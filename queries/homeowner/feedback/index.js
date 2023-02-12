const insertFeedback = `INSERT INTO FIX8.dbo.FEEDBACK 
(JobId,Rate,Comment,SenderId,ReceiverId,Date)
VALUES(@id,@rate,@comment,@senderid,@receiverid,GETUTCDATE())`;
const getFeedbackByJobId = `SELECT * FROM FIX8.dbo.FEEDBACK f  WHERE f.JobId = @id`;

module.exports = {
    insertFeedback,
    getFeedbackByJobId
}