const getInvoiceByJOId = `SELECT * FROM FIX8.dbo.INVOICE i WHERE i.JobOrderId = @id AND i.Status = 1`;
const insertPayment = `INSERT INTO FIX8.dbo.PAYMENT (InvoiceID, PaymentMethod, Amount, ReferenceNumber, PaymentReceipt, Status, DateCreated)
VALUES(@InvoiceID, @PaymentMethod, @Amount, @ReferenceNumber, @PaymentReceipt, @Status, GETUTCDATE())`;
const markInvoiceAsPaid = `UPDATE FIX8.dbo.INVOICE SET Status = 3 WHERE Id = @id`;

module.exports = {
    getInvoiceByJOId,
    insertPayment,
    markInvoiceAsPaid
}