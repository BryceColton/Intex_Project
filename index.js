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
    host: process.env.RDS_HOSTNAME || "localhost",
    user: process.env.RDS_USERNAME || "postgres",
    password: process.env.RDS_PASSWORD || "$uperDuper6",
    database: process.env.RDS_DATABASE || "ebdb",
    port: process.env.RDS_PORT || 5432,
    ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false,
  },
});
// This is all of the information needed to access postgres

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

// This is the get method to render the manageEvents page and display data from the events table
app.get("/manageEvents", (req, res) => {
  knex("events")
    .select()
    .then((events) => {
      //.then() says, I just queried all this data, send it to this variable planets.
      //the array of rows gets stored in this variable called planets.
      // Render the maintainPlanets template and pass the data
      res.render("manageEvents", { events }); //render index.ejs and pass it planets.
    })
    .catch((error) => {
      console.error("Error querying database:", error);
      res.status(500).send("Internal Server Error");
    });
});

// This is the get method to render the manageVolunteers page and display data from the volunteers table
app.get("/manageVolunteers", (req, res) => {
  res.render("manageVolunteers");
});

// This is to add a volunteer to the database
app.post("/submitVolunteerForm", (req, res) => {
  // Extract form values from req.body
  const vol_email = req.body.vol_email;
  const vol_first_name = req.body.vol_first_name;
  const vol_last_name = req.body.vol_last_name;
  const vol_phone = req.body.vol_phone;
  const sewing_level = parseInt(req.body.sewing_level, 10);
  const sewing_ = parseInt(req.body.sewing_level, 10);
  // Insert the new Pokémon into the database
  knex("pokemon")
    .insert({
      description: description.toUpperCase(), // Ensure description is uppercase
      base_total: base_total,
      date_created: date_created,
      active_poke: active_poke,
      gender: gender,
      poke_type_id: poke_type_id,
    })
    .then(() => {
      res.redirect("/"); // Redirect to the Pokémon list page after adding
    })
    .catch((error) => {
      console.error("Error adding Pokémon:", error);
      res.status(500).send("Internal Server Error");
    });
});

// This starts the server to start listening to requests
app.listen(port, () => console.log(`Listening on port ${port}`));
