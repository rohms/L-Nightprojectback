const express = require("express");
const app = express();
const nodemailer = require("nodemailer")
const cors = require("cors");
require("dotenv").config()


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


    


const PORT = process.env.PORT || 4000;
app.get('/', (req, res) => res.send('Welcome'))

app.listen(PORT, ()  => {
    console.log(`Server running on port ${PORT}`);
})

