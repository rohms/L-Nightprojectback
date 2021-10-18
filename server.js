const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT || 4000;
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const eventsRoute = require("./routes/eventsRoute");
const adminUserRoute = require("./routes/adminUserRoute");

// Body parser middleware
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors())

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.EMAIL,
        pass: process.env.PASS,
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    },
});

transporter.verify((err, success) => {
    err
    ? console.log(err)
    : console.log(`=== Server is ready to take messages: ${success} ===`)
});

app.post("/send_mail", (req, res) => {
    console.log(req.body)
  
    let mailOptions = {
        from: `${req.body.mailerState.email}`,
        to: process.env.EMAIL,
        subject: `Message from: ${req.body.mailerState.email}`,
        text: `${req.body.mailerState.message}`,
      };

    transporter.sendMail(mailOptions, (error, data) => {
        console.log(mailOptions)
        if(error){
            res.json({
                status: "fail",
            });
        } else{
            console.log("Email sent successfully");
            res.json({ status: "success" });
        }
     });
 
 });

app.get('/', (req, res) => res.send('Welcome to Mongo db api'))


app.use("/adminusers", adminUserRoute);
app.use("/events", eventsRoute);

// Connecting to mongoose
mongoose.connect(
    process.env.MONGODB_URI,
    {
        dbName: process.env.DB_NAME,
        user: process.env.DB_User,
        pass: process.env.DB_Pass,
        // userNewUrlParser: true,
    },
    () => {
        console.log("connected to MongoDB");
    }
);

db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error"));

app.listen(PORT, ()  => {
    console.log(`Server running on port ${PORT}`);
})
