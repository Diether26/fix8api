const checkPassword = `SELECT * FROM FIX8.dbo.USERS WHERE Id = @id AND Password = @password`;
const changePassword = `UPDATE FIX8.dbo.USERS SET Password = @password WHERE Id = @id`;
const updateAdminAccount = `
    UPDATE FIX8.dbo.USERS
    SET Firstname = @Firstname,
        Middlename = @Middlename,
        Lastname = @Lastname,
        Email = @Email,
        ContactNumber = @ContactNumber,
        Birthdate = @Birthdate,
        Address = @Address,
        Sex = @Sex
    WHERE Id = @id`;
const updateAvatar = `UPDATE FIX8.dbo.USERS 
    SET Avatar = @Avatar
    WHERE Id = @id`;
module.exports = {
    checkPassword,
    changePassword,
    updateAdminAccount,
    updateAvatar
}