const getUserByEmail = "SELECT * FROM FIX8.dbo.USERS WHERE Email = @email";
const getUserByUsername = "SELECT * FROM FIX8.dbo.USERS WHERE Username = @username";
const insertAdministrator = `INSERT INTO FIX8.dbo.USERS
([Firstname]
,[Middlename]
,[Lastname]
,[Email]
,[ContactNumber]
,[Birthdate]
,[Address]
,[Sex]
,[Avatar]
,[Certification]
,[Resume]
,[Experties]
,[WorkExperience]
,[Username]
,[Password]
,[Usertype]
,[Status]
,[DateCreated]
,[DateModified])
VALUES
(@Firstname
,@Middlename
,@Lastname
,@Email
,@ContactNumber
,@Birthdate
,@Address
,@Sex
,@Avatar
,'N/A'
,'N/A'
,'N/A'
,'N/A'
,@Username
,@Password
,'Administrator'
,1
,GETUTCDATE()
,null)`;
const getCountActiveAdmin = "SELECT [Count] = COUNT (*) FROM FIX8.dbo.USERS WHERE Usertype = 'Administrator' and Status = 1";

module.exports = {
    getUserByEmail,
    getUserByUsername,
    insertAdministrator,
    getCountActiveAdmin
}