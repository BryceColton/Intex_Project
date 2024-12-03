const express = require("express");
const app = express();
const path = require("path");
const dotenv = require('dotenv');

app.use(express.static(path.join(__dirname, 'public')));


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
    }
});

app.get('/', (req, res) => {
    res.render("index")
})

app.get('/display', (req, res) => {
    knex('volunteers')
        .select()
        .then(volunteers => {
            res.render("display", { volunteers: volunteers });
        })
        .catch(err => {
            console.error("Error fetching users:", err);
            res.status(500).send("Error fetching data from the database");
        });
});

// Start the server
app.listen(port, () => console.log(`Listening on port ${port}`));
