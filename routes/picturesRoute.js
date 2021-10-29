const express = require('express');
const picturesRoute = express.Router();
const multer = require('multer');
const { GridFsStorage } = require("multer-gridfs-storage");
const mongoose = require("mongoose");
const Picture = require("../models/files");
const MongoURI = process.env.MONGODB_URI



const filefilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' 
        || file.mimetype === 'image/jpeg'){
            cb(null, true);
        }else {
            cb(null, false);
        }
};


const storage = new GridFsStorage({
    url: MongoURI,
    bucketName: "pictures",
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file : (req, file) => {
        const match = ["image/png", "image/jpeg", "image/jpg"];

        if (match.indexOf(file.mimetype) === -1) {
            const filename = `${Date.now()}"-${file.originalname}`;
            return filename;
        }

        return {
            bucketName: "photos",
            filename: `${Date.now()}-${file.originalname}`,
        };
    },
});


const upload = multer({
    storage:storage,
    limits: {fileSize: 1024 * 1024 * 5},    
    filefilter: filefilter
});   



// get all the pics
picturesRoute.get('/', (req, res)=>{
    if(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }); else{
        res.status(200).json(res)
    }
});




//upload a single pic
picturesRoute.post('/upload', upload.single("picture"), (req, res, next) => {
    const url = req.protocol + '://' + req.get('host')
    console.log(req.file)
    let file = new Picture ({
        _id: new mongoose.Types.ObjectId(),
        fileName: req.file.originalname,
        filePath:  '/public/' + req.file.filename,
        fileType: req.file.mimetype,
        picture: url + '/public/' + req.file.filename,

    });
    file.save().then(result => {
        res.status(201).json({
            message: "Picture uploaded successfully",
            pictureCreated: {
                picture: result.picture,
                name: result.name,
                filePath: result.path,
            }
        })
    }).catch(err => {
        console.log(err),
            res.status(500).json({
                error: err
            });
        });
});
 
module.exports = picturesRoute;