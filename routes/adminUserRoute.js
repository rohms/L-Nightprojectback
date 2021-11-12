const express = require("express");
const adminUserRoute = express.Router();
adminUserRoute.use(express.json());
adminUserRoute.use(express.urlencoded());
const User = require("../models/adminUser.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();


// To get all the admin users
adminUserRoute.get("/", (req, res) => {
    User.find()
    .select("name email")
    .then((user) => res.json(user))
    .catch((user) => res.sendStatus(500)); 
});

// To get the admin per id
adminUserRoute.get("/:id", (req, res) => {
    User.findOne( {_id: req.params.id })
    .select("name email")
    .then((user) => res.json(user))
    .catch((user) => res.sendStatus(404)); 
});

// To create an admin user, will be blocked for the moment
// adminUserRoute.post("/register", async (req, res) => {
//     const checkEmail = await User.findOne({ email: req.body.email });

//     if (checkEmail) return res.status(400).send("User exists already");
//     const salt = await bcrypt.genSalt(10);
//     const hashPassword = await bcrypt.hash(req.body.password, salt);

//     const user = new User({
//         name: req.body.name,
//         email: req.body.email,
//         password: hashPassword
//     })
//     user.save()
//     res.send({ user })
// });

// check for login
adminUserRoute.post("/login", async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send(`User doesn't exist`);

    const checkPassword = await bcrypt.compare(req.body.password, user.password);
    if (!checkPassword) return res.status(404).send("Wrong password");

    const token = jwt.sign({ user: user }, process.env.SECRET);
    res.header("auth-token", token);
    res.json(token);
});

// To update an admin user
adminUserRoute.put("/:id", (req, res) => {
    User.updateOne({ _id: req.params.id }, { $set: req.body})
    .then((Updateduser) => res.json(Updateduser))
    .catch((err) => res.json(err));
});

module.exports = adminUserRoute;