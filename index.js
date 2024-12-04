const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv");

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

// This is the get method to render the admin page
app.get("/admin", (req, res) => {
  res.render("admin");
});

// ADMIN MANAGE EVENTS ROUTES ***************************************************************************************************************

// This is the get method to render the manageEvents page and display data from the events, completed_events, and finalized_events tables
app.get("/manageEvents", (req, res) => {
  // Query the events
  knex("events")
    .select()
    .then((upcoming_events) => {
      //This variable represents one object that has attributes, which are the column names
      if (!upcoming_events) {
        return res.status(404).send("Upcoming events not found");
      }
      //get data from finalized events table to send with the upcoming events
      knex("finalized_events")
        .select()
        .then((finalized_events) => {
          //render both the upcoming_events (events table) and finalized_events
          res.render("manageEvents", { upcoming_events, finalized_events });
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
  console.log(req.query);
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

// This route updates a specific event's status in the database to determine if it is an approved or declined event

// ADMIN MANAGE VOLUNTEERS ROUTES ***********************************************************************************************************

// This is the get method to render the manageVolunteers page and display data from the volunteers table
app.get("/manageVolunteers", (req, res) => {
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
app.get("/adminAddVolunteer", (req, res) => {
  res.render("adminAddVolunteer");
});
// This is the post route to add a volunteer from the admin page
app.post("/adminAddVolunteer", (req, res) => {
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
    })
    .returning("eventid")
    .then(([eventid]) => {
      res.redirect(`/eventstep2?id=${eventid}`);
    })
    .catch((err) => {
      console.error("Database insert error:", err);
      res.status(500).json({ message: "Error saving the event", error: err });
    });
});

// This is to add a volunteer to the database
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
  // Insert the database
  knex("volunteers")
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
});

// This starts the server to start listening to requests
app.listen(port, () => console.log(`Listening on port ${port}`));
