const updateHomeownerAccount = `
UPDATE FIX8.dbo.USERS
SET Firstname = @Firstname
    ,Middlename = @Middlename
    ,Lastname = @Lastname
    ,Email = @Email
    ,ContactNumber = @ContactNumber
    ,Birthdate = @Birthdate
    ,Address = @Address
    ,Sex = @Sex
    ,Avatar = @Avatar
    ,DateModified = GETUTCDATE()
WHERE Id = @id`;       


module.exports = {
    updateHomeownerAccount
}