const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const fileSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    fileName: {type: String, required: true},
    filePath: {type: String, required: true},
    fileType: {type: String, required: true},
},
{timestamps: true});

module.exports = mongoose.model("Picture", fileSchema);