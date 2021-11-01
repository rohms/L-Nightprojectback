const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT || 4000;
const nodemailer = require("nodemailer");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const { body,  validationResult } = require("express-validator");
const eventsRoute = require("./routes/eventsRoute");
const adminUserRoute = require("./routes/adminUserRoute");
const picturesRoute = require("./routes/picturesRoute");



// NEED TO CHECK THIS TOO
 const Validator = [
     body("mailerState.name").isString().not().isEmpty().withMessage("Name is required"),
     body("mailerState.email").isEmail().withMessage("Valid email is required"),
     body("mailerState.subject").isString({min : 4, max : 50}).not().isEmpty().withMessage("Minimum lenght is 4 characters"),
     body("mailerState.message").isString({ min: 5 }).not().isEmpty().withMessage("Please write your message.")
 ];



// Body parser middleware
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors())


let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        // xoauth2: xoauth2.createXOAuth2Generator({})
        user: process.env.EMAIL,
        pass:  process.env.PASS,
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: "1//04hR8ewn3RzeNCgYIARAAGAQSNwF-L9IrnmVNpoZlATBXIQid9VXwQw5PzCjji4mtxgQelZO0zJ_OPIDKwwsq-d1vovJ2RyzyrrU",
        // accessToken: process.env.ACCESS_TOKEN,
    
    },
});

transporter.verify((err, success) => {
    err
    ? console.log(err)
    : console.log(`=== Server is ready to take messages: ${success} ===`)
});


app.post("/send_mail", Validator, (req, res) => {
    const errors = validationResult(req); 
    if(!errors.isEmpty()){
        return res.json({
            status: "fail",
        });
    }
  
    let mailOptions = {
        from: `${req.body.mailerState.email}`,
        to: process.env.EMAIL,
        subject: `From: ${req.body.mailerState.name} ${req.body.mailerState.email} Sub: ${req.body.mailerState.subject}`,
        text: `${req.body.mailerState.message}`,
        // token: string,
      };

        

      const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY

      const humanKey = "03AGdBq27VleyqEt3sc0YZ0MtqzLOj3ycqqQf0J7nM5zWFBxwmqIWgs2jsuTgrhcQ-O40TrNo9qp6ZAofnkCLa1Q1PE_1GGWYVFO0AC6_OGfrIoOL1BTPTqnjY8bpzHfVpkPoRh0xxVoFaytLCUnMKPRG_Dh6Y6CflyEDKrRrxwHMF2oK3pUNoi3UMiTxG1TCcjNP-NUUiu0UWmO4H8BtL7ytOZ-mItl4qmFlJDqWIFbLOAwtNkJdIfpQmIFIFSGIcIwYfPn3U0GZ_rFiXDbyw0ptR0RYg7XD4g7TLI2RZBsfJIdCjdBNGLof9amhRhXTxqXbyHsDoxKUQXrz67x2vknRPommiulSmaV8QzhjDKuwJ1rH0j236dUNiIPWZbCmAGTbboT_SjvjAsqIoSen62zV3Zax_LI61W9AxL6KERLfXahfytvkKKT-yhNTKgJwkcuWJCcKOYHEB"

      // validate human
          const isHuman = axios (`https://www.google.com/recaptcha/api/siteverify`, {
          method: "post",
          headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
          },
            body: `secret=${RECAPTCHA_SECRET_KEY}&response=${humanKey}`
     })
         .then(json => json.success)
         .catch(err => {
              throw new Error(`Error in Google Siteverify API. ${err.message}`)
         })
          if (humanKey === null || !isHuman) {
             throw new Error(`You are not a human.`)
          }


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

// Routes
app.use("/adminusers", adminUserRoute);
app.use("/events", eventsRoute);
app.use("/pictures", picturesRoute);

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


app.listen(PORT, ()  => {
    console.log(`Server running on port ${PORT}`);
})
