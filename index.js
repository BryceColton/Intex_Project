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
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DATABASE,
    port: process.env.RDS_PORT,
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
  res.render("display");
});

// This is the get method to display the data about the events to the admin
app.get("/manageEvents", (req, res) => {
  res.render("manageEvents");
});

// This is the get method to display the data about volunteers to the admin
app.get("/manageVolunteers", (req, res) => {
  res.render("manageVolunteers");
});

// This starts the server to start listening to requests
app.listen(port, () => console.log(`Listening on port ${port}`));
