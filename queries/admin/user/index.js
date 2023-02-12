const getUsers = `SELECT u.id,firstname,middlename,lastname,email,contactnumber,birthdate,address,sex,status = us.Status,usertype,username,password
                  FROM FIX8.dbo.USERS u 
	              LEFT OUTER JOIN FIX8.dbo.USER_STATUS us ON u.Status = us.Id`;
const getUsersById = `SELECT Id, Firstname, Middlename, Lastname, Email, Contactnumber, Birthdate, Address,Sex, Usertype, Username, Password FROM FIX8.dbo.USERS WHERE id = @id`;
const updateUser = `UPDATE FIX8.dbo.USERS
                    SET Firstname = @Firstname,
                        Middlename = @Middlename,
                        Lastname = @Lastname,
                        Email = @Email,
                        ContactNumber = @ContactNumber,
                        Birthdate = @Birthdate,
                        Sex = @Sex,
                        Address = @Address,
                        Username = @Username,
                        Password = @Password
                    WHERE Id = @id`;
const updateStatus = `UPDATE FIX8.dbo.USERS
                      SET Status = @Status
                      WHERE Id = @id`;
const activateUser = `UPDATE FIX8.dbo.USERS
SET Status = 1
WHERE Id = @id`;
const deactivateUser = `UPDATE FIX8.dbo.USERS
SET Status = 2
WHERE Id = @id`;
const banUser = `UPDATE FIX8.dbo.USERS
SET Status = 3
WHERE Id = @id`;
const deleteUser = `UPDATE FIX8.dbo.USERS
SET Status = 4
WHERE Id = @id`;

module.exports ={
    getUsers,
    getUsersById,
    updateUser,
    updateStatus,
    activateUser,
    deactivateUser,
    banUser,
    deleteUser
}
