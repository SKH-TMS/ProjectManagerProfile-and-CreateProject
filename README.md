# ProjectManager-Profile-and-Create-Project

Erros have been resolved on on "Navbar" , "NavbarUser" and "LoginUser" , These pages are updated to accoumudate the functionality of the ProjectManager, Also some pages and routes have been added for the functionality of the create Project.

# Version 2

## Errors:

1.  Anyone could do functionality of admin,user,Project Manager by writing the link in the search bar.Although some functionalities were limited by the token checking there were some whom were still missing.
2.  Error of sometime mixing the Profile of User and Project Manager.

## Resolved by:

1. Checking token Presence on every route.
2. Introducing the new function in the "utlis/token.ts" named "GetuserRole" and using it at "api/auth/token/route.ts"

# Version 3

## Changes

1. In this version I have renamed the Attributes of the Project so they can be easily read by eveyone.
2. I also Added the ProjectID attribute to the Model of Project(Its functionality is similer to the ID of the User)

## Make it work

in order to make this work you have to delete the projects collection from ther team_management_db Database

# Project Creation Form is improved in Repo # T27
