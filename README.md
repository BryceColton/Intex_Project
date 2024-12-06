Here are our videos as well

IS 403 requirements video walks through the website

https://byu.box.com/s/omg9emm7x4jjvbci8yhikbfzbn43hfns

🖥️ Codebase
The source code for the project can be found on GitHub:
Turtle Shelter Project Repository
Link to github source code

https://github.com/BryceColton/Intex_Project


Turtle Shelter Project 🌍
The Turtle Shelter Project is a web application created to support the efforts of the nonprofit organization Turtle Shelter Project. This platform simplifies event management, volunteer coordination, and donation tracking, enabling the organization to focus on its mission of making a difference.


Dependencies:
    "dayjs": "^1.11.13",
    "dotenv": "^16.4.5",
    "ejs": "^3.1.10",
    "express": "^4.21.1",
    "express-session": "^1.18.1",
    "knex": "^3.1.0",
    "pg": "^8.13.1"

Run NPM Install once cloning or unzipping the file


🚀 Features Overview
Navigation
The application features a user-friendly navigation bar with the following routes:

Home (/)
Includes a project introduction and an overview of the cause.

Jen's Story (/jensStory)
Highlights a personal story to connect visitors with the project's mission.

Volunteer (/volunteer)
Allows users to sign up as volunteers or team members.

Host an Event (/hostEvent)
Enables users to propose new events for the organization.

Donate
Redirects to the official donation page:
Turtle Shelter Project Donation.
https://turtleshelterproject.org/checkout/donate?donatePageId=5b6a44c588251b72932df5a0

🏠 Home Page
The homepage also includes a View Events button (/publicEvents) that displays upcoming public events, encouraging community engagement.

🤝 Volunteer Page (/volunteer)
Visitors can:

Fill out a form to anonymously sign up as a volunteer.
Opt to become a team member, providing a password for their account.
Team member applications are sent to admins for approval.
Once approved, members can log in via the Team Member Login page (/teamMemberLogin) to RSVP for events.
Approved Credentials for Testing:
Username: nn@n
Password: password
🛠 Host an Event Page (/hostEvent)
Users can propose events by submitting:

Event details
Two preferred dates
Submissions are sent to admins with a status of pending, allowing them to approve or decline the event and select a suitable date.

🌟 Admin Portal
Admins can manage the application using a dedicated portal with enhanced functionality.

Accessing the Admin Portal:
To access the admin portal:

Navigate to /admin
Redirects to /login.
Use approved credentials or create a new admin account via /create-admin.
Admin Testing Credentials:
Username: newAdmin@gmail.com
Password: something
🛠 Admin Features
Admin Home (/admin)
Includes an automatically updated Tableau dashboard for monitoring data.

Manage Admin Users (/manageUsers)
Admins can:

Add new admins (/adminAddUser)
Edit or delete existing admins (/editUser/:id, /deleteUser/:id)
Manage Volunteers (/manageVolunteers)
Admins can view and manage:

Registered Volunteers: Edit or delete submissions.
Team Members: Approve, decline, edit, or delete accounts.
Manage Events (/manageEvents)
Features include:

Pending Events Table
View event details (/viewEvent/:eventid)
Approve or decline events (/handlingPendingEvent/eventid)
Assign team member requirements for approved events.
Upcoming Events Table
Monitor RSVPs.
Log completed event stats (/viewCompletedEvent/eventid).
Completed Events
View event statistics or delete records.
Declined Events
Review and delete declined event submissions.
Add New Event
Instantly approve and add events to the upcoming events list.
📊 Data Management
The admin dashboard dynamically tracks and updates key data points, streamlining operational workflows.

🌐 Deployment
The application is hosted on:
https://hometownseopro.com

🔑 Credentials for Testing
Team Member Login:

Username: nn@n
Password: password


Admin Login:

Username: newAdmin@gmail.com
Password: something

Let me know if you'd like additional details
  
  
  

  







# Intex_Project
