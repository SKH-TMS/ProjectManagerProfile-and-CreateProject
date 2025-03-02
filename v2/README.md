# Version 2

## Errors:

1.  Anyone could do functionality of admin,user,Project Manager by writing the link in the search bar.Although some functionalities were limited by the token checking there were some whom were still missing.
2.  Error of sometime mixing the Profile of User and Project Manager.

## Resolved by:

1. Checking token Presence on every route.
2. Introducing the new function in the "utlis/token.ts" named "GetuserRole" and using it at "api/auth/token/route.ts"
