# Version 4

## Changes

1. Removed the asssignlogs from the Project.ts
2. renamed the AssignedProjectLogs model collection to assigned_project_2_team.
3. Now when assigning the Project we first seacrh for all the projectIDs in the Project and then compare then to assigned_project_2_team. if the id exists the project is assigned and vise versa.
