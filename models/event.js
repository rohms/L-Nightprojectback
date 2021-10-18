const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Event = new Schema({
    eventname: String,
    start_time: { type: Date, default: Date.now()},
    location: String,
    address: String,
    description: String
})

module.exports = mongoose.model("Event", Event);