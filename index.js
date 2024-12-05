const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv");
const session = require("express-session");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);
app.use(express.static(path.join(__dirname, "public")));

// Load environment variables from .env file
dotenv.config();

const port = process.env.PORT || 3000;

// Set view engine to ejs
app.set("view engine", "ejs");

// Set views directory
app.set("views", path.join(__dirname, "views"));

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: true,
  })
);
// Initialize knex with database connection settings
const knex = require("knex")({
  client: "pg",
  connection: {
    host:
      process.env.RDS_HOSTNAME ||
      "awseb-e-auisjkadk8-stack-awsebrdsdatabase-evtdlb1elxoo.c98cyywwyjtd.us-east-1.rds.amazonaws.com",
    user: process.env.RDS_USERNAME || "ebroot",
    password: process.env.RDS_PASSWORD || "Yodayoda663!",
    database: process.env.RDS_DB_NAME || "ebdb",
    port: process.env.RDS_PORT || 5432,
    ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false,
  },
});
// This is all of the information needed to access postgres

//PUBLIC FACING ROUTES ****************************************************************************************************************

// This is the get method for the root file
app.get("/", (req, res) => {
  res.render("index");
});

// This is the get method for the volunteer page
app.get("/volunteer", (req, res) => {
  res.render("volunteer");
});

// This is the get method for the host event request page
app.get("/hostEvent", (req, res) => {
  res.render("hostEvent");
});

// This is the get method to render the jensStory page
app.get("/jensStory", (req, res) => {
  res.render("jensStory");
});

// app.get("/publicEvents", (req, res) => {
//   res.render("publicEvents");
// });

function isAuthenticated(req, res, next) {
  if (req.session && req.session.isLoggedIn) {
    return next(); // User is authenticated, proceed to the next middleware
  }
  res.redirect("/login"); // Redirect to login page if not authenticated
}

app.get("/login", (req, res) => {
  res.render("login", { error: null }); // Ensure `error` is defined
});

app.get("/create-admin", (req, res) => {
  res.render("createAdmin", { message: null }); // Pass an empty message initially
});

app.post("/create-admin", (req, res) => {
  const { admin_username, admin_password, admin_first_name, admin_last_name } = req.body;

  // Simple validation to check if all fields are provided
  if (!admin_username || !admin_password || !admin_first_name || !admin_last_name) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Check if the username already exists
  knex("admin")
    .where({ admin_user_name: admin_username })
    .first()
    .then((existingAdmin) => {
      if (existingAdmin) {
        return res.status(400).json({ message: "Username already exists." });
      }

      // Insert new admin into the database
      return knex("admin").insert({
        admin_user_name: admin_username,
        admin_password: admin_password, // Make sure you're storing the password safely
        admin_first_name: admin_first_name,
        admin_last_name: admin_last_name,
      });
    })
    .then(() => {
      res.redirect("/login");
    })
    .catch((error) => {
      console.error("Error creating admin:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Simple validation to check if both fields are provided
  if (!username || !password) {
    return res.render("login", { error: "Both username and password are required." });
  }

  // Check if the user exists in the admin table
  knex("admin")
    .where({ admin_user_name: username })
    .first()
    .then((admin) => {
      if (!admin) {
        return res.render("login", { error: "Invalid username or password." });
      }

      // Check if the provided password matches the stored password
      if (admin.admin_password !== password) {
        return res.render("login", { error: "Invalid username or password." });
      }

      // If login is successful, set session variables (you can use express-session for this)
      req.session.isLoggedIn = true;
      req.session.adminUsername = username;

      // Redirect to a protected page or dashboard
      res.redirect("/admin"); // You can change this to whatever route is appropriate
    })
    .catch((error) => {
      console.error("Error during login:", error);
      res.render("login", { error: "Internal server error." });
    });
});

// ADMIN ROUTES *******************************************************************************************************************************

// This is the get method to render the admin page
app.get("/admin", isAuthenticated, (req, res) => {
  res.render("admin");
});

// This is the get method to render the manageEvents page and display data from the events table
app.get("/manageEvents", isAuthenticated, (req, res) => {
  knex("events")
    .select()
    .where("status", "pending")
    .then((pending_events) => {
      //This variable represents one object that has attributes, which are the column names
      if (!pending_events) {
        return res.status(404).send("No pending events found");
      }
      //get data from finalized events table to send with the upcoming events
      knex("events")
        .select()
        .join("finalized_events", "events.eventid", "=", "finalized_events.eventid") // Join the tables
        .where("status", "approved")
        .orderBy([{ column: "date", order: "asc" }])
        .then((approved_events) => {
          res.render("manageEvents", { pending_events, approved_events });
        });
    })
    .catch((error) => {
      console.error("Error fetching finalized event details:", error);
      res.status(500).send("Internal Server Error");
    });
});

// This route is tied to the view button on pending event requests.
app.get("/viewEvent/:eventid", isAuthenticated, (req, res) => {
  let eventid = req.params.eventid;
  knex("events")
    .where("eventid", eventid)
    .first() //returns an object representing one record
    .then((event) => {
      //This variable represents one object that has attributes, which are the column names
      if (!event) {
        return res.status(404).send("Event not found");
      }
      res.render("viewEvent", { event });
    })
    .catch((error) => {
      console.error("Error fetching event details:", error);
      res.status(500).send("Internal Server Error");
    });
});

// This route is to update the status of an event in the database after an admin approves or denies it.
app.post("/handlePendingEvent/:eventid", async (req, res) => {
  const eventid = req.params.eventid;
  const status = req.body.status;
  const final_date = req.body.date; // Date from the form

  try {
    // Convert the date to UTC for both tables
    const formattedDate = dayjs(final_date).utc().format("YYYY-MM-DD HH:mm:ss");

    await knex.transaction(async (trx) => {
      // Update the `events` table
      await trx("events").update({ status: status }).where("eventid", eventid);

      // Insert into `finalized_events` with UTC date
      await trx("finalized_events").insert({
        eventid: eventid,
        date: formattedDate,
      });
    });

    res.redirect("/manageEvents");
  } catch (error) {
    console.error("Error handling event transaction:", error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

// This route makes the admin delete event functionality
app.post("/deleteEvent/:eventid", isAuthenticated, (req, res) => {
  const id = req.params.eventid;
  knex("events")
    .where("eventid", id)
    .del() // Deletes the record with the specified ID
    .then(() => {
      res.redirect("/manageEvents"); // Redirect to the volunteers list after deletion
    })
    .catch((error) => {
      console.error("Error deleting Event:", error);
      res.status(500).send("Internal Server Error");
    });
});

// This route is for the admin to view declined events
app.get("/adminDeclinedEvents", isAuthenticated, (req, res) => {
  knex("events")
    .select()
    .where("status", "declined")
    .then((declined_events) => res.render("declinedEvents", { declined_events }));
});

// This route deletes a declined event and redirects to the declined events page.
app.post("/deleteDeclinedEvent/:eventid", isAuthenticated, (req, res) => {
  const id = req.params.eventid;
  knex("events")
    .where("eventid", id)
    .del() // Deletes the record with the specified ID
    .then(() => {
      res.redirect("/adminDeclinedEvents"); // Redirect to the declined events list after deletion
    })
    .catch((error) => {
      console.error("Error deleting Event:", error);
      res.status(500).send("Internal Server Error");
    });
});

// This route is the get route for the admin to create their own events to show in the upcoming events table
app.get("/adminAddEvent", isAuthenticated, (req, res) => {
  res.render("adminAddEvent");
});

// This route is the post route for the admin to add an event
app.post("/adminAddEvent", isAuthenticated, (req, res) => {
  console.log(req.body);
  const {
    event_name,
    organization,
    organizer_first_name,
    organizer_last_name,
    org_phone,
    org_email,
    event_type,
    event_address,
    city,
    state,
    zip,
    public,
    guest_speaker,
    venuedescription,
    numexpected,
    duration,
    eventdatetime1,
  } = req.body;

  knex("events")
    .insert({
      event_name: event_name,
      organization: organization,
      organizer_first_name: organizer_first_name,
      organizer_last_name: organizer_last_name,
      org_phone: org_phone,
      org_email: org_email,
      event_type: event_type,
      event_address: event_address,
      city: city,
      state: state,
      zip: zip,
      public: public === "on", // Convert checkbox to boolean
      guest_speaker: guest_speaker === "on", // Convert checkbox to boolean
      numexpected: parseInt(numexpected, 10), // Ensure it's stored as an integer
      venuedescription: venuedescription,
      duration: parseFloat(duration), // Ensure it's stored as a float
      eventdatetime1: new Date(eventdatetime1), // Ensure it's stored as a valid Date
      eventdatetime2: null, // Ensure it's stored as a valid Date
      status: "approved",
    })
    .returning("eventid")
    .then(([event]) => {
      // Destructure the event object properly
      const { eventid } = event; // Get the eventid from the returned object
      return knex("finalized_events").insert({
        eventid: eventid,
        date: new Date(eventdatetime1), // Ensure the date is in a valid format
      });
    })
    .then(() => {
      res.redirect("/manageEvents");
    })
    .catch((err) => {
      console.error("Database insert error:", err);
      res.status(500).json({ message: "Error saving the event", error: err });
    });
});

// This is the get method to render the manageVolunteers page and display data from the volunteers table
app.get("/manageVolunteers", isAuthenticated, (req, res) => {
  knex("volunteers")
    .select()
    .then((volunteers) => {
      //.then() says, I just queried all this data, send it to this variable planets.
      //the array of rows gets stored in this variable called planets.
      // Render the maintainPlanets template and pass the data
      res.render("manageVolunteers", { volunteers }); //render index.ejs and pass it planets.
    })
    .catch((error) => {
      console.error("Error querying database:", error);
      res.status(500).send("Internal Server Error");
    });
});

// This is the get route to add a volunteer from the admin page
app.get("/adminAddVolunteer", isAuthenticated, (req, res) => {
  res.render("adminAddVolunteer");
});
// This is the post route to add a volunteer from the admin page
app.post("/adminAddVolunteer", isAuthenticated, (req, res) => {
  // Extract form values from req.body
  const vol_email = req.body.vol_email;
  const vol_first_name = req.body.vol_first_name;
  const vol_last_name = req.body.vol_last_name;
  const vol_phone = req.body.vol_phone;
  const sewing_level = parseInt(req.body.sewing_level, 10);
  const num_hours = parseFloat(req.body.num_hours, 10);
  const origin = req.body.origin;
  const zip = req.body.zip;
  // Insert the database
  knex("volunteers")
    .insert({
      vol_email: vol_email,
      vol_first_name: vol_first_name,
      vol_last_name: vol_last_name,
      vol_phone: vol_phone,
      sewing_level: sewing_level,
      num_hours: num_hours,
      origin: origin,
      zip: zip,
    })
    .then(() => {
      res.redirect("/manageVolunteers"); // Redirect to admin manage volunteers after submit
    })
    .catch((error) => {
      console.error("Error adding Volunteer:", error);
      res.status(500).send("Internal Server Error");
    });
});

app.get("/viewCompletedEvent/:eventid", (req, res) => {
  const eventid = req.params.eventid;
  const date = req.body.date;
  knex("events")
    .join("finalized_events", "events.eventid", "=", "finalized_events.eventid") // Join the tables
    .where("events.eventid", eventid)
    .first() //returns an object representing one record
    .then((event) => {
      //This variable represents one object t hat has attributes, which are the column names
      if (!event) {
        return res.status(404).send("Event not found");
      }

      if (event && event.date) {
        event.date = new Date(event.date).toString();
      }

      console.log(event);
      res.render("viewCompletedEvent", { event });
    })
    .catch((error) => {
      console.error("Error fetching event details:", error);
      res.status(500).send("Internal Server Error");
    });
});

app.get("/something", (req, res) => {
    res.render("something")
})


app.get("/viewFinishedEvent/:eventid", (req, res) => {
  const eventid = req.params.eventid;
  knex("events")
    .join("finalized_events", "events.eventid", "=", "finalized_events.eventid")
    .join("completed_events", "events.eventid", "=", "completed_events.eventid") // Join the tables
    .where("events.eventid", eventid)
    .first() //returns an object representing one record
    .then((event) => {
      //This variable represents one object t hat has attributes, which are the column names
      if (!event) {
        return res.status(404).send("Event not found");
      }

      if (event && event.date) {
        event.date = new Date(event.date).toString();
      }

      console.log(event);
      res.render("viewFinishedEvent", { event });
    })
    .catch((error) => {
      console.error("Error fetching event details:", error);
      res.status(500).send("Internal Server Error");
    });
});
// This is the get route to edit a volunteer's data from the admin page
app.get("/editVolunteer/:vol_email", isAuthenticated, (req, res) => {
  //This is the route for editVolunteer. The /: means there is a parameter passed in called vol_email.
  const id = req.params.vol_email;
  // Query the Volunteer by email first
  knex("volunteers")
    .where("vol_email", id)
    .first() //returns an object representing one record
    .then((volunteer) => {
      //This variable represents one object that has attributes, which are the column names
      if (!volunteer) {
        return res.status(404).send("Volunteer not found");
      }
      res.render("editVolunteer", { volunteer });
    })
    .catch((error) => {
      console.error("Error fetching Volunteer for editing:", error);
      res.status(500).send("Internal Server Error");
    });
});

app.get("/liveCounter", (req, res) => {
  knex("completed_events")
    .sum("num_distributed as totalCompleted")  // Sum the num_completed column
    .first()  // We only want one row with the sum
    .then((result) => {
      // Check if the sum is returned correctly
      console.log(result);  // Log the result to verify
      res.json(result);  // Send the sum as a JSON response
    })
    .catch((error) => {
      console.error("Error fetching live counter:", error);
      res.status(500).send("Internal Server Error");
    });
});

app.get("/publicEvents", (req, res) => {
  knex("events")
    .join("finalized_events", "events.eventid", "=", "finalized_events.eventid")
    .select()
    .where("events.public", true)
    .then((events) => {
      console.log("Fetched Events:", events);

      res.render("publicEvents", { events }); // Pass `events` to EJS template
    })
    .catch((error) => {
      console.error("Error fetching events:", error);
      res.status(500).send("Internal Server Error");
    });
});

app.get("/adminCompletedEvents", (req, res) => {
  knex("completed_events")
    .select()
    .then((completed_events) => {
      res.render("completedEvents", { completed_events }); //render index.ejs and pass it planets.
    })
    .catch((error) => {
      console.error("Error querying database:", error);
      res.status(500).send("Internal Server Error");
    });
});

app.post("/viewCompletedEvent/:eventid", isAuthenticated, (req, res) => {
  let eventid = req.params.eventid;
  const { num_actual, num_pocket, num_collar, num_envelopes, num_vests, num_completed, num_distributed, status } = req.body;

  // Set defaults for optional fields if they are not provided (i.e., set to 0)
  const numPocket = num_pocket || 0;
  const numCollar = num_collar || 0;
  const numEnvelopes = num_envelopes || 0;
  const numVests = num_vests || 0;
  const numCompleted = num_completed || 0;
  const numdistributed = num_distributed || 0;

  // Insert the data into the "completed_events" table
  knex("completed_events")
    .insert({
      eventid: eventid,
      num_actual: num_actual,
      num_pocket: numPocket,
      num_collar: numCollar,
      num_envelopes: numEnvelopes,
      num_vests: numVests,
      num_completed: numCompleted,
      num_distributed: numdistributed
    })
    .then(() => {
      // Update the event status in the "events" table
      knex("events")
        .where({ eventid: eventid })
        .update({
          status: status,
        })
        .then(() => {
          res.redirect("/manageEvents");
        })
        .catch((error) => {
          console.error("Error updating event status:", error);
          res.status(500).send("Error updating event status");
        });
    })
    .catch((error) => {
      console.error("Error adding Completing Event:", error);
      res.status(500).send("Internal Server Error");
    });
});

// This is the post route to edit a volunteer's data from the admin page
app.post("/editVolunteer/:vol_email", isAuthenticated, (req, res) => {
  const id = req.params.vol_email;

  const vol_email = req.body.vol_email;
  const vol_first_name = req.body.vol_first_name;
  const vol_last_name = req.body.vol_last_name;
  const vol_phone = req.body.vol_phone;
  const origin = req.body.origin;
  const zip = req.body.zip;
  const sewing_level = parseInt(req.body.sewing_level);
  const num_hours = parseInt(req.body.num_hours);
  // Update the Planet in the database
  knex("volunteers")
    .where("vol_email", id)
    .update({
      vol_email: vol_email,
      vol_first_name: vol_first_name,
      vol_last_name: vol_last_name,
      vol_phone: vol_phone,
      origin: origin,
      zip: zip,
      sewing_level: sewing_level,
      num_hours: num_hours,
    })
    .then(() => {
      res.redirect("/manageVolunteers"); // Redirect to the list of Volunteers after saving
    })
    .catch((error) => {
      console.error("Error updating Volunteer:", error);
      res.status(500).send("Internal Server Error");
    });
});

// This is the route to delete a volunteer from the volunteers table
app.post("/deleteVolunteer/:vol_email", isAuthenticated, (req, res) => {
  const id = req.params.vol_email;
  knex("volunteers")
    .where("vol_email", id)
    .del() // Deletes the record with the specified ID
    .then(() => {
      res.redirect("/manageVolunteers"); // Redirect to the volunteers list after deletion
    })
    .catch((error) => {
      console.error("Error deleting Volunteer:", error);
      res.status(500).send("Internal Server Error");
    });
});

// This is the get method to render the manageUsers page and display data from the admin table
app.get("/manageUsers", isAuthenticated, (req, res) => {
  knex("admin")
    .select()
    .then((users) => {
      //.then() says, I just queried all this data, send it to this variable planets.
      //the array of rows gets stored in this variable called planets.
      // Render the maintainPlanets template and pass the data
      res.render("manageUsers", { users }); //render index.ejs and pass it planets.
    })
    .catch((error) => {
      console.error("Error querying database:", error);
      res.status(500).send("Internal Server Error");
    });
});

// This is the get route to edit an admin from the admin page
app.get("/editUser/:admin_user_name", isAuthenticated, (req, res) => {
  //This is the route for editVolunteer. The /: means there is a parameter passed in called vol_email.
  const id = req.params.admin_user_name;
  // Query the Volunteer by email first
  knex("admin")
    .where("admin_user_name", id)
    .first() //returns an object representing one record
    .then((admin) => {
      //This variable represents one object that has attributes, which are the column names
      if (!admin) {
        return res.status(404).send("Admin not found");
      }
      res.render("editUser", { admin });
    })
    .catch((error) => {
      console.error("Error fetching Volunteer for editing:", error);
      res.status(500).send("Internal Server Error");
    });
});

app.get("/adminAddUser", isAuthenticated, (req, res) => {
  res.render("adminAddUser");
});

// This is the post route to add an admin from the admin page
app.post("/adminAddUser", isAuthenticated, (req, res) => {
  // Extract form values from req.body
  const admin_user_name = req.body.admin_user_name;
  const admin_password = req.body.admin_password;
  const admin_first_name = req.body.admin_first_name;
  const admin_last_name = req.body.admin_last_name;

  // Insert the database
  knex("admin")
    .insert({
      admin_user_name: admin_user_name,
      admin_password: admin_password,
      admin_first_name: admin_first_name,
      admin_last_name: admin_last_name,
    })
    .then(() => {
      res.redirect("/manageUsers"); // Redirect to admin manage volunteers after submit
    })
    .catch((error) => {
      console.error("Error adding User:", error);
      res.status(500).send("Internal Server Error");
    });
});

// This is the post route to edit a volunteer's data from the admin page
app.post("/editUser/:admin_user_name", isAuthenticated, (req, res) => {
  const id = req.params.admin_user_name;

  const admin_user_name = req.body.admin_user_name;
  const admin_password = req.body.admin_password;
  const admin_first_name = req.body.admin_first_name;
  const admin_last_name = req.body.admin_last_name;
  // Update the Planet in the database
  knex("admin")
    .where("admin_user_name", id)
    .update({
      admin_user_name: admin_user_name,
      admin_password: admin_password,
      admin_first_name: admin_first_name,
      admin_last_name: admin_last_name,
    })
    .then(() => {
      res.redirect("/manageUsers"); // Redirect to the list of Volunteers after saving
    })
    .catch((error) => {
      console.error("Error updating Volunteer:", error);
      res.status(500).send("Internal Server Error");
    });
});

// This is the route to delete an admin from the volunteers table
app.post("/deleteUser/:admin_user_name", isAuthenticated, (req, res) => {
  const id = req.params.admin_user_name;
  knex("admin")
    .where("admin_user_name", id)
    .del() // Deletes the record with the specified ID
    .then(() => {
      res.redirect("/manageUsers"); // Redirect to the volunteers list after deletion
    })
    .catch((error) => {
      console.error("Error deleting Volunteer:", error);
      res.status(500).send("Internal Server Error");
    });
});
// PUBLIC FACING ROUTES ****************************************************************************************************

// Submit event form
app.post("/submitEventForm", (req, res) => {
  const {
    event_name,
    organization,
    organizer_first_name,
    organizer_last_name,
    org_phone,
    org_email,
    event_type,
    event_address,
    city,
    state,
    zip,
    is_public,
    has_guest_speaker,
    numexpected,
    venuedescription,
    duration,
    eventdatetime1,
    eventdatetime2,
  } = req.body;

  knex("events")
    .insert({
      event_name,
      organization,
      organizer_first_name,
      organizer_last_name,
      org_phone,
      org_email,
      event_type,
      event_address,
      city,
      state,
      zip,
      public: is_public === "on", // Convert checkbox to boolean
      guest_speaker: has_guest_speaker === "on", // Convert checkbox to boolean
      numexpected: parseInt(numexpected, 10), // Ensure it's stored as an integer
      venuedescription,
      duration: parseFloat(duration), // Ensure it's stored as a float
      eventdatetime1: new Date(eventdatetime1), // Ensure it's stored as a valid Date
      eventdatetime2: new Date(eventdatetime2), // Ensure it's stored as a valid Date
    })

    .returning("eventid")
    .then(([eventid]) => {
      res.redirect("/");
    })
    .catch((err) => {
      console.error("Database insert error:", err);
      res.status(500).json({ message: "Error saving the event", error: err });
    });
});

app.post("/submitVolunteerForm", (req, res) => {
  // Extract form values from req.body
  const vol_email = req.body.vol_email;
  const vol_first_name = req.body.vol_first_name;
  const vol_last_name = req.body.vol_last_name;
  const vol_phone = req.body.vol_phone;
  const sewing_level = parseInt(req.body.sewing_level, 10);
  const num_hours = parseFloat(req.body.num_hours, 10);
  const origin = req.body.origin;
  const zip = req.body.zip;

  // Check if email already exists
  knex("volunteers")
    .where({ vol_email: vol_email })
    .first() // Returns the first match or null if no match
    .then((existingVolunteer) => {
      if (existingVolunteer) {
        return res.status(400).json({ message: "Email already exists." });
      }

      // If the email doesn't exist, proceed to insert the new volunteer
      return knex("volunteers")
        .insert({
          vol_email: vol_email, // Ensure description is uppercase
          vol_first_name: vol_first_name,
          vol_last_name: vol_last_name,
          vol_phone: vol_phone,
          sewing_level: sewing_level,
          num_hours: num_hours,
          origin: origin,
          zip: zip,
        })
        .then(() => {
          res.redirect("/"); // Redirect to the home page after adding
        })
        .catch((error) => {
          console.error("Error adding Volunteer:", error);
          res.status(500).send("Internal Server Error");
        });
    })
    .catch((error) => {
      console.error("Error checking email:", error);
      res.status(500).send("Internal Server Error");
    });
});

// This starts the server to start listening to requests
app.listen(port, () => console.log(`Listening on port ${port}`));
