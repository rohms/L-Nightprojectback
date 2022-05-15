const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT || 4000;
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const { body, validationResult } = require("express-validator");
const eventsRoute = require("./routes/eventsRoute");
const adminUserRoute = require("./routes/adminUserRoute");
const picturesRouteb = require("./routes/picturesRouteb");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const Validator = [
  body("mailerState.name")
    .isString()
    .not()
    .isEmpty()
    .withMessage("Name is required"),
  body("mailerState.email").isEmail().withMessage("Valid email is required"),
  body("mailerState.subject")
    .isString({ min: 4, max: 50 })
    .not()
    .isEmpty()
    .withMessage("Minimum lenght is 4 characters"),
  body("mailerState.message")
    .isString({ min: 5 })
    .not()
    .isEmpty()
    .withMessage("Please write your message."),
];

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const OAuth2Client = new OAuth2(
  process.env.OAUTH_CLIENTID,
  process.env.OAUTH_CLIENT_SECRET,
  process.env.EMAIL.REDIRECT_URI
);

OAuth2Client.setCredentials({
  refresh_token: process.env.OAUTH_REFRESH_TOKEN,
});

let accessToken = OAuth2Client.getAccessToken();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  // service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL,
    // pass: process.env.PASS,
    clientId: process.env.OAUTH_CLIENTID,
    accessToken,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((err, success) => {
  err
    ? console.log(err)
    : console.log(`=== Server is ready to take messages: ${success} ===`);
});

app.post("/send_mail", Validator, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({
      status: "fail",
    });
  }

  let mailOptions = {
    from: `${req.body.mailerState.email}`,
    to: process.env.EMAIL,
    subject: `From: ${req.body.mailerState.name} ${req.body.mailerState.email} Sub: ${req.body.mailerState.subject}`,
    text: `${req.body.mailerState.message}`,
  };

  const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
  const humanKey = process.env.RECAPTCHA_HUMAN_KEY;

  // validate human
  const isHuman = axios(`https://www.google.com/recaptcha/api/siteverify`, {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    },
    body: `secret=${RECAPTCHA_SECRET_KEY}&response=${humanKey}`,
  })
    .then((json) => json.success)
    .catch((err) => {
      throw new Error(`Error in Google Siteverify API. ${err.message}`);
    });
  if (humanKey === null || !isHuman) {
    throw new Error(`You are not a human.`);
  }

  transporter.sendMail(mailOptions, (error, data) => {
    console.log(mailOptions);
    if (error) {
      res.json({
        status: "fail",
      });
    } else {
      console.log("Email sent successfully");
      res.json({ status: "success" });
    }
  });
});

app.get("/", (req, res) => res.send("Welcome to Mongo db api"));

// Routes
app.use("/adminusers", adminUserRoute);
app.use("/events", eventsRoute);
app.use("/pictures", picturesRouteb);

// Connecting to mongoose
mongoose.connect(
  process.env.MONGODB_URI,
  {
    dbName: process.env.DB_NAME,
    user: process.env.DB_User,
    pass: process.env.DB_Pass,
  },
  () => {
    console.log("connected to MongoDB");
  }
);

db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
