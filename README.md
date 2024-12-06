
Link to github source code

https://github.com/BryceColton/Intex_Project


Turtle Shelter Project
Overview
The Turtle Shelter Project is a web application to help the non profit organization Turtle Shelter Project. 

A Walkthrough on how to use our website on the homepage at the domain https://hometownseopro.com on the home page we have the introduction to the project and cause. There is a navbar that has 

Home button which uses the root route "/", 
Jen's Story button "/jensStory", 
Volunteer button "/volunteer", 
host an event button "/hostevent", 
Donate button which uses the donate route from their original website "https://turtleshelterproject.org/checkout/donate?donatePageId=5b6a44c588251b72932df5a0".


Home Page Routes besides the navbar there is a 

  "View Events" button route "publicEvents" which on the public side of the page displays upcoming public     events.

Volunteer Page has a form for an anonymous volunteer

  the post route for the vounteer form "/volunteerSubmissionForm" 

  On this page if somebody wants to become more involved and become a team member they can select 'Become a   team member?'. When this is selected an input to create a password is displayed and the user can then     
  enter their password and submit the form and that is created for the account of the team member. Then 
  that is sent to the Admins to then decide to approve or decline the account. Once the account is 
  approved. The "Team Member Login" the user can select this button which uses route "/teamMemberLogin" and 
  then login with their email and password they submitted on the volunteer form.

TeamMemberLogin Page


  Displays a login page with Username and Password the user can then enter their email and password they 
  had submitted on their volunteer submission form. 
  Once a team member logs in and their account is approved. Upcoming events table will display with an RSVP   button for each event. The team member can then select RSVP for the event they want to go to. The Team   
  members registered will then go up by one and the user will not be able to RSVP a spot for that event   
  again.

  FOR THE TA's an approved username and email for team member is 

  USERNAME: nn@n
  PASSWORD: password



HOST EVENT Page

  Uses Route "/hostEvent" to fill out the information any anonymous user can enter information for an event
  Once the user fills out the info and the two date options for the admins to choose from. The form is then 
  sent to the admins as a pending event. The admins can then choose a date that works best for them and 
  approve or decline the event

  The post route "/eventFormSubmission" send the information to the database with a status "pending". The 
  admins on their "/manageEvents" route can then choose a date option and approve or decline the event.

  
DONATE BUTTON on Navbar

  Redirects to the organizations donate page 
  "https://turtleshelterproject.org/checkout/donate?donatePageId=5b6a44c588251b72932df5a0"


FOR THE TA's to acces the admin page there is no button for security. To access the admin portal use route:

  "/admin"

  When entering this route into the URL "https://hometownseopro.com/admin" it will redirect to 
  "https://hometownseopro.com/login".

  To create a new admin use route "https://hometownseopro.com/create-admin". The admin is automatically   
  created and then redirected to "/login"

  FOR TA's you can create an admin with "create-admin" or login information below

  USERNAME: newAdmin@gmail.com
  PASSWORD: something

  Once logged in it will go to "https://hometownseopro.com/admin" on the /admin route it will display the 
  tableua dashboard that is automatically updated when new data is entered. On the /admin the navbar has 
  the buttons: 

  Admin Home: "/admin"
  Manage Admin Users: "/manageUsers"
  Manage Volunteers: "/manageVolunteers"
  Manage Events: "/manageEvents"


Manage Admin Users
  On Manage Admin Users page an admin can manage the other admin accounts and edit and maintain their   
  information username and password. 
  There is a Add New Admin button "/adminAddUser" which an admin can then create another admin account and 
  submit it. 
  The post route is "/adminAddUser" POST. Once that is submitted the Admin will be redirected to manage 
  admin users. There is also a delete button to delete an 
  admin "/deleteUser/:id". The edit button will edit the information of an admin "editUser/:id" and then 
  submit the post route is "editUser/:id".

Manage Volunteers 

  On the manage volunteers page route "/manageVolunteers" There are two tables displayed "Registered   
  Volunteers" and "Team Members". On the registered volunteers this displays all volunteers one's that 
  were just submitting their info anonymously on the public side. The Team Members table has the 
  volunteers that want to more involved and become a team member". 

  Registered volunteers table the Admin can edit a volunteers information and delete them completley. The 
  edit route is /editVolunteer/:volunteer_email and the post route is the same. For the delete the route 
  is /deleteVolunteer/:volunteer_email. This table gives a main list for the admins to choose from with 
  their contact info and locations/zips.

  Team Members Table On this table the admin can approve or decline an account request from a team member 
  they can also edit and delete. The route /editTeamMember/tm_email will display the team members info the 
  admin can then edit their information password and email and then submit with a post of the same route. 
  The delete route is /deleteTeamMember/tm_email will delete them. On the edit page is where the admin can 
  approve or decline the account request. Once the account is approved. That team member can login on the 
  Team Member sign up on the volunteer page on the public side. They can then RSVP for Upcoming Events


Manage Events Page
  Pending Event Requests Table 
  Upcoming Events Table
  On the route "https://hometownseopro.com/manageEvents" There is a Pending Event Requests Table where the 
  admins can view the event on the "/viewEvent/:eventid" route. This page displays the event details the 
  admin can select a date from the date options that works best and also input the number of team members 
  needed. There is an approve and decline button to approve the event or decline it. The POST route is 
  "/handlingPendingEvent/eventid" when the submit form is selected that information is sent and the 
  approved events are moved to the Upcoming Events Table. There is also a delete 

  Upcoming Events Table

  Displays upcoming events the admin can then view the upcoming and input the number of the event. On the route "viewCompletedEvent/eventid" it displays the event details. Then the admin can input the number of completed products and vests distributed etc. The admin will then select completed and then finish. The form is then completed and the admin is redirected to manage events page. On the top of the Pending Events table there is a View Completed Events and View Declined Events as well as Add New Event

  With Add New Event 
   The admin can add an even that event is automatically set to approved and sent to upcoming events table.

  View Completeed Events Table 

  Displays the stats from each event. There is also a view option to see all of the specific events details. There is a delete option as well

View Decline Events 

Teh decline events table displays any events that were decline there is a view and delete option for each event in declined

  
 
  
  
  
  

  







# Intex_Project
