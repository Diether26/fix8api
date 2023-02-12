const getUserByEmail = "SELECT * FROM FIX8.dbo.USERS WHERE Email = @email";
const getUserByUsername = "SELECT * FROM FIX8.dbo.USERS WHERE Username = @username";
const insertElectrician = `INSERT INTO FIX8.dbo.USERS
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
,@Certificate
,@Resume
,@Experties
,@Experience
,@Username
,@Password
,'Electrician'
,1
,GETUTCDATE()
,null)`

module.exports = {
    getUserByEmail,
    getUserByUsername,
    insertElectrician
}