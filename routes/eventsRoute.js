const express = require("express");
const eventsRoute = express.Router();
eventsRoute.use(express.json());
eventsRoute.use(express.urlencoded({ extended: true }));
const Event = require("../models/event");
require("dotenv").config();

// GET ALL EVENTS
eventsRoute.get("/", (req, res) => {
  Event.find()
    .then((event) => res.json(event))
    .catch((err) => res.json(err));
});

// GET EVENT BY ID
eventsRoute.get("/:id", (req, res) => {
  Event.findOne({ _id: req.params.id })
    .then((event) => res.json(event))
    .catch((event) => res.sendStatus(404));
});

// CREATE AN EVENT
eventsRoute.post("/", async (req, res) => {
  Event.create(req.body)
    .then((newEvent) => res.json(newEvent))
    .catch((err) => res.json(err));
});

// EDIT EVENT BY ID
eventsRoute.put("/:id", (req, res) => {
  Event.updateOne({ _id: req.params.id }, { $set: req.body })
    .then((Updatedevent) => res.json(Updatedevent))
    .catch((err) => res.json(err));
});

// delete event by id
eventsRoute.delete("/:id", (req, res) => {
  Event.deleteOne({
    _id: req.params.id,
  })
    .then(() => res.json("Event was deleted"))
    .catch((err) => res.json(err));
});

module.exports = eventsRoute;
