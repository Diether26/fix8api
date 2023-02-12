const getInvoices = `SELECT i.*, _Status = ivs.Status,
CASE 
	WHEN i.Status = 3
		THEN 
			p.Id
	ELSE NULL
END as [PaymentID]
FROM FIX8.dbo.INVOICE i
LEFT OUTER JOIN FIX8.dbo.INVOICE_STATUS ivs ON i.Status = ivs.Id
LEFT OUTER JOIN FIX8.dbo.PAYMENT p ON i.Id = p.InvoiceID
WHERE i.ClientID = @uid`;
const getInvoiceById = `SELECT i.*, _Status = ivs.Status,
CASE 
	WHEN i.Status = 3
		THEN 
			p.Id
	ELSE NULL
END as [PaymentID]
FROM FIX8.dbo.INVOICE i
LEFT OUTER JOIN FIX8.dbo.INVOICE_STATUS ivs ON i.Status = ivs.Id
LEFT OUTER JOIN FIX8.dbo.PAYMENT p ON i.Id = p.InvoiceID
WHERE i.ClientID = @uid AND i.Id = @id`;

const getInvoiceItemsByInvoiceId = `SELECT * FROM FIX8.dbo.INVOICE_ITEM ii WHERE ii.InvoiceID = @id and ii.isActive = 1`;

const getPaymentByID = `SELECT p.*
FROM FIX8.dbo.INVOICE i
LEFT OUTER JOIN FIX8.dbo.INVOICE_STATUS ivs ON i.Status = ivs.Id
LEFT OUTER JOIN FIX8.dbo.PAYMENT p ON i.Id = p.InvoiceID
WHERE i.ClientID = @uid AND p.Id = @id`;

module.exports = {
    getInvoices,
    getInvoiceById,
    getInvoiceItemsByInvoiceId,
    getPaymentByID
}