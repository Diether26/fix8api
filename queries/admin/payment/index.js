const getPayments = `SELECT p.Id, p.PaymentMethod, p.Amount, p.ReferenceNumber, ps.Status, p.DateCreated,inv.Id as invoice_id,s.Id as subscribe_id
FROM FIX8.dbo.PAYMENT p
	LEFT OUTER JOIN FIX8.dbo.PAYMENT_STATUS ps ON ps.Id = p.Status
	LEFT OUTER JOIN FIX8.dbo.INVOICE inv ON inv.Id = p.InvoiceID
	LEFT OUTER JOIN FIX8.dbo.SUBSCRIPTION s ON s.Id = p.SubscriptionID`;

const getInvoiceDetail = `SELECT * FROM FIX8.dbo.INVOICE WHERE Id = @Id;` ;
const getInvoiceItem = `SELECT * FROM FIX8.dbo.INVOICE_ITEM ii WHERE ii.InvoiceID = @Id and ii.isActive = 1` ;
const getSubscription = `SELECT s.Id, u.Lastname + ', ' + u.Firstname + ' ' + u.Middlename as SubscriberName, u.ContactNumber, u.Email, u.Usertype, s.SubscribeDate,
		[PaymentMethod] = (SELECT PaymentMethod
		FROM FIX8.dbo.PAYMENT 
		WHERE SubscriptionID = s.Id),
		[PaymentReceipt] = (SELECT PaymentReceipt
		FROM FIX8.dbo.PAYMENT 
		WHERE SubscriptionID = s.Id)
	FROM FIX8.dbo.SUBSCRIPTION s 
	LEFT OUTER JOIN FIX8.dbo.USERS u ON u.Id = s.UserID 
	WHERE s.Id = @Id and u.Status = 1`;
const getInvoiceRequestDetail = `SELECT j.ServiceName ,j.JobType,j.ContactNumber,
		[Requested_To] = (SELECT Lastname + ', ' + Firstname + ' ' + Middlename  
			FROM FIX8.dbo.USERS 
			WHERE Id = j.RequestedTo
			),
		[Requested_By] = (SELECT Lastname + ', ' + Firstname + ' ' + Middlename  
			FROM FIX8.dbo.USERS 
			WHERE Id = j.RequestedBy
			), p.PaymentReceipt, p.PaymentMethod
		FROM FIX8.dbo.PAYMENT p
		LEFT OUTER JOIN FIX8.dbo.INVOICE i ON i.Id = p.InvoiceID
		LEFT OUTER JOIN FIX8.dbo.JOB_ORDER j ON j.Id = i.JobOrderId
		WHERE i.Id = @Id`;
// const getInvoiceDetails = `SELECT inv.ServiceFee, inv.TotalCost, inv.PaymentMethod,invs.Status,inv.CreateDate,inv.DueDate
// 	FROM FIX8.dbo.INVOICE inv
// 	LEFT OUTER JOIN FIX8.dbo.INVOICE_STATUS invs ON invs.Id = inv.Status
// 	WHERE inv.Id = @invoice_id`;

module.exports = {
    getPayments,
	getInvoiceDetail,
	getInvoiceItem,
	getSubscription,
	getInvoiceRequestDetail
}