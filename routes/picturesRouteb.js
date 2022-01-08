const express = require("express");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const Picture = require("../models/files");
const picturesRouteb = express.Router();

const multer = require("multer");
const upload = multer({ dest: "public/" });

const { uploadFile, getFileStream } = require("../s3");

// get a certain picture
picturesRouteb.get("/:key", (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);

  readStream.pipe(res);
});

// get all the pictures
picturesRouteb.get("/", (req, res) => {
  const key = req.params;
  const readStream = getFileStream(key);

  readStream.pipe(res);
});

picturesRouteb.post(
  "/upload",
  upload.single("picture"),
  async (req, res, next) => {
    const file = req.file;
    console.log(file);

    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/JPEG" ||
      file.mimetype === "image/PNG" ||
      file.mimetype === "image/JPG" ||
      file.mimetype === "image/jpg"
    ) {
      // cb(null, true);
      const result = await uploadFile(file);
      await unlinkFile(file.path);
      console.log(result);
      const description = req.body.description;
      res.send({ imagePath: `/upload/${result.Key}` });
    } else {
      // cb(new Error("Invalid file type."), false);

      res.send("Wrong filetype");
      console.log(Error);
    }
  }
);

module.exports = picturesRouteb;
