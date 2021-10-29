const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");

const storage = new GridFsStorage({
    url: process.env.MONGODB_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        const match = ["image/png", "image/jpeg", "image/png"];

        if (match.indexOf(file.mimetype) === -1) {
            const filename = `${Date.now()}-any-name-${file.originalname}`;
            return filename;
        }

        return {
            bucketName: "pictures",
            filename: `${Date.now()}-any-name-${file.originalname}`,
        };
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"||
        file.mimetype === "image/png"){
            cb(null, true);
        } else{
            cb(new Error("The image you tried to upload is not a jpg/jpeg or png"), false);
        }
    
}

module.exports = multer({ storage, fileFilter });
