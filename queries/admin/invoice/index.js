const getInvoice = `SELECT i.id,jo.ServiceName, jo.JobType, jo.ContactNumber, jo.AppointmentDate,
        (SELECT Firstname + ',' + Lastname
        FROM FIX8.dbo.USERS 
        WHERE Id = jo.RequestedTo
        ) as Electrician,
        (SELECT Firstname + ',' + Lastname
        FROM FIX8.dbo.USERS 
        WHERE Id = jo.RequestedBy
        ) as Homeowner, i.ServiceFee, i.TotalCost, i.PaymentMethod
    , _Status = ivs.Status, i.CreateDate, i.DueDate,
    CASE 
        WHEN i.Status = 3
            THEN 
                p.Id
        ELSE NULL
    END as [PaymentID]
    FROM FIX8.dbo.INVOICE i
    LEFT OUTER JOIN FIX8.dbo.INVOICE_STATUS ivs ON i.Status = ivs.Id
    LEFT OUTER JOIN FIX8.dbo.PAYMENT p ON i.Id = p.InvoiceID
    LEFT OUTER JOIN FIX8.dbo.JOB_ORDER jo ON jo.Id = i.JobOrderId`;

const getInvoiceDetail = `SELECT * FROM FIX8.dbo.INVOICE WHERE Id = @id;` ;
const getInvoiceItem = `SELECT * FROM FIX8.dbo.INVOICE_ITEM ii WHERE ii.InvoiceID = @id and ii.isActive = 1` ;
const getPaymentInfo = `SELECT Id, PaymentMethod, Amount, ReferenceNumber, PaymentReceipt, DateCreated FROM FIX8.dbo.PAYMENT WHERE InvoiceID = @id` ;
module.exports ={
    getInvoice,
    getInvoiceDetail,
    getInvoiceItem,
    getPaymentInfo
}