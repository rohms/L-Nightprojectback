const S3 = require("aws-sdk/clients/s3");
require("dotenv").config();
const fs = require("fs");
const accesskeyId = process.env.AWS_ACCESS_KEY_ID;
const secretaccesskey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketname = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_DEFAULT_REGION;

const s3 = new S3({
  region,
  accesskeyId,
  secretaccesskey,
});

// uploads a file to s3
function uploadFile(file) {
  const fileStream = fs.createReadStream(file.path);
  const mimetype = file.mimetype;

  const uploadParams = {
    Bucket: bucketname,
    Body: fileStream,
    Key: file.originalname,
    ContentType: mimetype,
  };

  return s3.upload(uploadParams).promise();
}
exports.uploadFile = uploadFile;

// downloading file from s3
function getFileStream(fileKey) {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketname,
  };
  return s3.getObject(downloadParams).createReadStream();
}
exports.getFileStream = getFileStream;
