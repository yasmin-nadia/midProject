const multer = require("multer");
const fileTypes = require("../constants/fileTypes");
const path = require("path");

const upload = multer({
  limits: {
    fileSize: 1073741824 / 2,
  },
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      if (file) {
        console.log("file found", file);
        callback(null, "./server/files");
      } else {
        console.log("file not found in multer");

        req.file.error = "No file was found";
        callback("No file was found", null);
      }
    },
    filename: (req, file, callback) => {
      if (file) {
        console.log("file found", file.originalname);
        callback(null, Date.now() + "_" + file.originalname);
      } else {
        callback("No file was found", null);
      }
    },
  }),
  fileFilter: (req, file, callback) => {
    if (file) {
      const extension = path.extname(file.originalname);
      if (fileTypes.includes(extension)) {
        console.log("It worked");
        callback(null, true);
      } else {
        callback(null, false);
      }
    } else {
      callback("No file found", false);
    }
  },
});

module.exports = upload;
