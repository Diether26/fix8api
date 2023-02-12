const insertInvoice = `INSERT INTO FIX8.dbo.INVOICE 
(JobOrderId, ClientId, Remarks, ServiceFee, TotalCost, PaymentMethod, Status, CreateDate, DueDate)
VALUES
(@JobOrderId, @ClientId, NULL, @ServiceFee, @TotalCost, @PaymentMethod, @Status, GETUTCDATE(), @DueDate);
SELECT SCOPE_IDENTITY() AS id`;
const insertInvoiceItem =  `INSERT INTO FIX8.dbo.INVOICE_ITEM 
(InvoiceID, Name, Quantity, Unit, Type, Price, isActive)
VALUES
(@InvoiceID, @Name, @Quantity, @Unit, @Type, @Price, 1)`;
const insertBillingInfo = `INSERT INTO FIX8.dbo.BILLING_INFO (InvoiceID, BankName, AccountNumber, AccountHolder, QrCode) 
VALUES (@InvoiceID, @BankName, @AccountNumber, @AccountHolder, @QrCode)`;
const insertPaymentCashOnHand = `INSERT INTO FIX8.dbo.PAYMENT (InvoiceID, SubscriptionID, PaymentMethod, Amount, ReferenceNumber, PaymentReceipt, Status, DateCreated) 
VALUES (@InvoiceID, NULL, 'Cash on Hand', @Amount, '', '', 3, GETUTCDATE())`

module.exports = {
    insertInvoice,
    insertInvoiceItem,
    insertBillingInfo,
    insertPaymentCashOnHand
}