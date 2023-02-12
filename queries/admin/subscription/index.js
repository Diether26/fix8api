const getListSubscriptions = `
SELECT s.id,
(SELECT Lastname + ', ' + Firstname + ' ' + Middlename
 FROM FIX8.dbo.USERS
 WHERE Id = s.UserID
) as SubscriptionName,s.SubscribeDate,ps.Status
FROM FIX8.dbo.SUBSCRIPTION s
LEFT OUTER JOIN FIX8.dbo.PAYMENT p ON s.Id = p.SubscriptionID
LEFT OUTER JOIN FIX8.dbo.PAYMENT_STATUS ps  ON p.Status = ps.Id`;

const approveSubscriptionPayment = `UPDATE FIX8.dbo.PAYMENT
SET Status = 3
WHERE SubscriptionID = @id`;

const rejectSubscriptionPayment = `UPDATE FIX8.dbo.PAYMENT
SET Status = 2
WHERE SubscriptionID = @id`;

const checkSubscriptionStatus = `
SELECT s.*, PaymentID = p.Id, 
p.PaymentMethod,
p.ReferenceNumber as PaymentReference,
p.PaymentReceipt,
p.DateCreated as PaymentDate,
ps.Status 
FROM FIX8.dbo.SUBSCRIPTION s
LEFT OUTER JOIN FIX8.dbo.PAYMENT p ON s.Id = p.SubscriptionID
LEFT OUTER JOIN FIX8.dbo.PAYMENT_STATUS ps  ON p.Status = ps.Id
WHERE s.Id = @id
`;

const getSubscriptionPaymentDetails = `
SELECT p.*, [StatusDesc] = ps.Status FROM FIX8.dbo.PAYMENT p 
LEFT OUTER JOIN FIX8.dbo.PAYMENT_STATUS ps ON p.Status = ps.Id
WHERE p.SubscriptionID = @id`;

module.exports = {
    getListSubscriptions,
    approveSubscriptionPayment,
    rejectSubscriptionPayment,
    checkSubscriptionStatus,
    getSubscriptionPaymentDetails
}