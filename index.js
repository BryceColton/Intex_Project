const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv");

const session = require("express-session");

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
        .where("status", "approved")
        .then((finalized_events) => {
          //render both the upcoming_events (events table) and finalized_events
          res.render("manageEvents", { pending_events, finalized_events });
        })
        .catch((error) => {
          console.error("Error fetching finalized event details:", error);
          res.status(500).send("Internal Server Error");
        });
    })
    .catch((error) => {
      console.error("Error fetching upcoming event details:", error);
      res.status(500).send("Internal Server Error");
    });
});

// This route is tied to the view button on pending event requests.
app.get("/viewEvent/:eventid", (req, res) => {
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
app.post("/handlePendingEvent/:eventid", (req, res) => {
  const eventid = req.params.eventid;
  const status = req.body.status;
  knex("events")
    .update({ status: status })
    .where("eventid", eventid)
    .then(() => {
      res.redirect("/manageEvents"); // Redirect to the list of events after saving
    })
    .catch((error) => {
      console.error("Error updating event:", error);
      res.status(500).send("Internal Server Error");
    });
});

// This route makes the admin delete event functionality
app.post("/deleteEvent/:eventid", (req, res) => {
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

// ADMIN MANAGE VOLUNTEERS ROUTES ***********************************************************************************************************

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

// This is the get route to edit a volunteer's data from the admin page
app.get("/editVolunteer/:vol_email", (req, res) => {
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

// This is the post route to edit a volunteer's data from the admin page
app.post("/editVolunteer/:vol_email", (req, res) => {
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
app.post("/deleteVolunteer/:vol_email", (req, res) => {
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
    .first()  // Returns the first match or null if no match
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
