PLMun Health Portal - Front-end Demo

HOW TO RUN
1. Extract the ZIP file.
2. Open the plmun_health_portal folder.
3. Double-click index.html, or open the folder in VS Code and use Live Server.
4. Sign in using:
   Username: admin
   Password: admin123

FEATURES
- Administrator login screen
- Dashboard summary cards and recent activity
- Patient registration and editing
- Patient search and profile view
- Clinic visit recording and visit history
- Basic reports by course
- LocalStorage persistence in the current browser

IMPORTANT
This is a front-end classroom prototype. LocalStorage is not a secure database.
Do not store real student health information in this version. For actual clinic use,
connect the interface to a secure backend (for example PHP + MySQL), implement
server-side authentication and role permissions, validate all data on the server,
and apply appropriate privacy/security safeguards.

LOGIN BACKGROUND
The login screen now uses the PLMun campus photo from the Wheree page you shared. It loads from the image host, so an internet connection is needed to display it.
