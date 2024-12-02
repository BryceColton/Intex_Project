

const express = require("express");
// This imports the express library

const  app = express();
// this calls the express objects gaining the attributes and values

const path = require("path");
// This is the path class allowing access to directory 

const dotenv = require('dotenv')

const port = process.env.PORT || 3000
// Assigning the port number to 5000

app.set("view engine", "ejs");
// This sets the view engine to ejs instead of html

app.set("views", path.join(__dirname, "views"));
// this calls the views folder and points to the directory and all of its files

app.use(express.urlencoded({extended: true}));
const knex = require("knex") ({
    client : "pg",
    connection : {
        host : process.env.RDS_HOST,
        user : process.env.RDS_USERNAME,
        password : process.env.RDS_PASSWORD,
        database : process.env.RDS_DATABASE,
        port : process.env.RDS_PORT,
        ssl: process.env.DB_SSL ? {rejectUnauthorized: false} : false

    }
})
// This is all of the information needed to access postgres

// This is the get method for the root file

app.get('/', (req, res) => {

  });


//   });
// This starts the server to start listening to requests
app.listen(port, () => console.log(`Listening on port ${port}`));