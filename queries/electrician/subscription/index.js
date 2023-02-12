const checkSubscriptionStatus = `SELECT s.*, ps.Status FROM  FIX8.dbo.SUBSCRIPTION s 
LEFT OUTER JOIN FIX8.dbo.PAYMENT p ON s.Id = p.SubscriptionID
LEFT OUTER JOIN FIX8.dbo.PAYMENT_STATUS ps ON p.Status = ps.Id
WHERE s.UserID = @uid`;
const insertSubscription = `INSERT INTO FIX8.dbo.SUBSCRIPTION 
(UserID,SubscribeDate)
VALUES(@uid,GETUTCDATE());
SELECT SCOPE_IDENTITY() AS id`;
const insertSubscriptionPayment = `INSERT INTO FIX8.dbo.PAYMENT (InvoiceID, SubscriptionID, PaymentMethod, Amount, ReferenceNumber, PaymentReceipt, Status, DateCreated)
VALUES(NULL, @subId, @paymentMethod, @amount, @referenceNumber, @receipt, 1, GETUTCDATE())`;

module.exports = {
    checkSubscriptionStatus,
    insertSubscription,
    insertSubscriptionPayment
}