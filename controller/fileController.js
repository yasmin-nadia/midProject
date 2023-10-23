const path = require("path");
const fs = require("fs");
const { success, failure } = require("../constants/common");
const bookModel = require("../model/book");
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const jsonwebtoken = require("jsonwebtoken");
const moment = require("moment");
const HTTP_STATUS = require("../constants/statusCodes");
const { fileLoader } = require("ejs");
const fileTypes = require("../constants/fileTypes");

class FileController {
  async uploadFile(req, res, next) {
    try {
      console.log("req.file", req.file);
      const fileExtension = path.extname(req.file.originalname);
      console.log("fileExtension", fileExtension);
      if (!fileTypes.includes(fileExtension)) {
        return res.status(404).send(failure("Only .jpg .png .jpeg .txt .pdf"));
      }
      if (!req.file) {
        return res.status(404).send(failure("Failed to upload file"));
      }
      // if (
      //   fileExtension === ".jpg" ||
      //   fileExtension === ".jpeg" ||
      //   fileExtension === ".png" ||
      //   fileExtension === ".JPG"
      // ) {
      //   fs.rename(
      //     req.file.path,
      //     path.join(__dirname, "..", "server", "files", req.file.filename),
      //     (err) => {
      //       if (err) throw err;
      //       console.log("Rename complete");

      //       return res.status(200).send(success("Rename complete"));
      //     }
      //   );
      // }
      return res.status(200).send({ message: "OK" });
      // if (fileExtensionreq.file_extension === ".pdf") {
      //   fs.rename(
      //     req.file.path,
      //     path.join(__dirname, "..", "server", "pdf", req.file.filename),
      //     (err) => {
      //       if (err) throw err;
      //       console.log("Rename complete");
      //       return res.status(200).send(success("Rename complete"));
      //     }
      //   );
      // }
      // if (fileExtension === ".txt") {
      //   fs.rename(
      //     req.file.path,
      //     path.join(__dirname, "..", "server", "texts", req.file.filename),
      //     (err) => {
      //       if (err) throw err;
      //       console.log("Rename complete");
      //       return res.status(200).send(success("Rename complete"));
      //     }
      //   );
      // }
    } catch (error) {
      console.log("Internal server error", error);
      return res.status(500).send(failure("Internal server error"));
    }
  }
  async getFile(req, res, next) {
    try {
      const { filepath } = req.params;
      console.log("filepath", filepath);
      // const exists = await fs.access(
      //   path.join(__dirname, "..", "server", "files", filepath)
      // );
      const exists = fs.existsSync(
        path.join(__dirname, "..", "server", "files", filepath)
      );
      console.log("exists", exists);

      if (!exists) {
        return res.status(404).send(failure("File not found"));
      }
      return res
        .status(200)
        .sendFile(path.join(__dirname, "..", "server", "files", filepath));
    } catch (error) {
      console.log(error);
      return res.status(500).send(failure("Internal server error"));
    }
  }
}

module.exports = new FileController();
