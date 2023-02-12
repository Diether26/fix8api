const getActiveElectricians = `
WITH CTE_FEEDBACK AS (
        SELECT * FROM FIX8.dbo.FEEDBACK
)
SELECT  u.Id, u.Firstname, u.Middlename, u.Lastname, u.Email, u.ContactNumber
        ,u.Birthdate, u.Address, u.Sex, u.Avatar, u.Certification
        ,u.Resume
        ,[AverageRate] = ISNULL((SELECT (SUM(f.Rate) / COUNT(*)) FROM CTE_FEEDBACK f WHERE f.ReceiverId = u.Id),0)
        ,[TotalFeedbackCount] = ISNULL((SELECT COUNT(*) FROM CTE_FEEDBACK f WHERE f.ReceiverId = u.Id),0)
        ,[MaxFeedbackRate] = ISNULL((SELECT MAX(f.Rate) FROM CTE_FEEDBACK f WHERE f.ReceiverId = u.Id),0)
        ,[MinFeedbackRate] = ISNULL((SELECT MIN(f.Rate) FROM CTE_FEEDBACK f WHERE f.ReceiverId = u.Id),0)
FROM FIX8.dbo.USERS u
WHERE Usertype = 'Electrician' and Status = 1`;
const getElectricianById = `
SELECT  [Id],[Firstname],[Middlename],[Lastname],[Email],[ContactNumber]
        ,[Birthdate],[Address],[Sex],[Avatar],[Certification]
        ,[Resume],[Experties],[WorkExperience]
FROM [FIX8].[dbo].[USERS]
WHERE [Usertype] = 'Electrician' and [Status] = 1 and [Id] = @id`;                
const getElectricianTop5Feedback = `
SELECT TOP 5  [FeedbackId] = f.Id, f.JobId, f.Rate, [RateDesc] = fr.Description, f.Comment,
        [FeedbackBy]= u.Lastname + ', ' + u.Firstname + ' ' + u.Middlename,
        [Date] = (convert(varchar(10), f.Date, 120))
FROM FIX8.dbo.FEEDBACK f 
LEFT OUTER JOIN FIX8.dbo.USERS u ON f.SenderId = u.Id
LEFT OUTER JOIN FIX8.dbo.FEEDBACK_RATING fr ON f.Rate = fr.Id
WHERE f.ReceiverId = @id
ORDER BY f.Date DESC`;           
const getElectricianFeedback = `
SELECT  [FeedbackId] = f.Id, f.JobId, f.Rate, [RateDesc] = fr.Description, f.Comment,
        [FeedbackBy]= u.Lastname + ', ' + u.Firstname + ' ' + u.Middlename,
        [Date] = (convert(varchar(10), f.Date, 120))
FROM FIX8.dbo.FEEDBACK f 
LEFT OUTER JOIN FIX8.dbo.USERS u ON f.SenderId = u.Id
LEFT OUTER JOIN FIX8.dbo.FEEDBACK_RATING fr ON f.Rate = fr.Id
WHERE f.ReceiverId = @id
ORDER BY f.Date DESC`;
const getElectricianFeedbackSummary = `
SELECT  [AverageRate] = ISNULL((SUM(f.Rate) / COUNT(*)),0), [TotalFeedbackCount] = COUNT(*), 
        [MaxFeedbackRate] = ISNULL(MAX(f.Rate),0), [MinFeedbackRate] = ISNULL(MIN(f.Rate),0)
FROM FIX8.dbo.FEEDBACK f 
WHERE f.ReceiverId = @id`;            


module.exports = {
    getActiveElectricians,
    getElectricianById,
    getElectricianTop5Feedback,
    getElectricianFeedback,
    getElectricianFeedbackSummary
}