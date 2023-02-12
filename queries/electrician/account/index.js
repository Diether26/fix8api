const updateElectricianAccount = `
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
    ,Resume = @Resume
    ,Certification = @Certificate
    ,Experties = @Experties
    ,WorkExperience = @Experience
    ,DateModified = GETUTCDATE()
WHERE Id = @id`;       


module.exports = {
    updateElectricianAccount
}