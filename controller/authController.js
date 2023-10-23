const path = require("path");
const fs = require("fs").promises;
const { success, failure } = require("../constants/common");
const userModel = require("../model/user");
const authModel = require("../model/auth");
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const jsonwebtoken = require("jsonwebtoken");
const moment = require("moment");
const HTTP_STATUS = require("../constants/statusCodes");
const { default: mongoose } = require("mongoose");
const { promisify } = require("util");
const ejs = require("ejs");
const transporter = require("../config/mail");
const ejsRenderFile = promisify(ejs.renderFile);
const crypto = require("crypto");
class authenController {
  async signUp(req, res) {
    try {
      const validation = validationResult(req).array();
      console.log("validation", validation);
      if (validation.length > 0) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Failed to validate the data", validation));
      }

      const { email, password, name, phone, address, role } = req.body;
      const existingUser = await authModel.findOne({ email: email });
      if (existingUser) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Email is already registered"));
      }

      console.log("password", password);
      const hashedPassword = await bcrypt.hash(password, 10).then((hash) => {
        return hash;
      });
      console.log(hashedPassword);
      const result = await userModel.create({
        email: email,
        name: name,
        phone: phone,
        address: address,
      });
      console.log("Resulttt", result);
      if (result) {
        console.log("result._id", result._id);
        const result2 = await authModel.create({
          email: email,
          password: hashedPassword,
          id: result._id,
          role: role,
        });
        console.log("result2", result2);
        if (!result2) {
          return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .send(success("Failed to store user information", result2));
        }
        console.log("result", result);
        console.log("result2", result2);
        return res
          .status(HTTP_STATUS.OK)
          .send(success("Authentication succeeded", result));
      } else {
        return res
          .status(HTTP_STATUS.OK)
          .send(success("Authentication has not been succeeded"));
      }
    } catch (error) {
      console.log("The error is", error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(success("Internal server error"));
    }
  }
  async login(req, res) {
    try {
      const { email, password, role } = req.body;
      const auth = await authModel.findOne({ email: email });
      if (!auth) {
        fs.appendFile(
          "../server/print.log",
          `Unregistered user tried logging in ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} PM`
        );
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(success("User is not registered"));
      }
      // if (auth.role !== role) {
      //     return res.status(400).send(success("Invalid Role"));
      // }
      if (auth.blocked) {
        const now = moment();
        const lastUnsuccessfulLoginTime = moment(
          auth.loginAttempts[auth.loginAttempts.length - 1].timestamp
        );

        console.log("lastUnsuccessfulLoginTime", lastUnsuccessfulLoginTime);
        if (now.diff(lastUnsuccessfulLoginTime, "minutes") >= 5) {
          auth.blocked = false;
          auth.loginAttempts = [];
          await auth.save();
        } else {
          fs.appendFile(
            "../server/print.log",
            `User blocked at ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} PM`
          );
          return res
            .status(HTTP_STATUS.FORBIDDEN)
            .send(success("User is blocked. Please try again after 1 minute"));
        }
      }
      const checkedPassword = await bcrypt.compare(password, auth.password);
      if (checkedPassword) {
        const creden = await authModel.findOne({ email: email }).populate("id");
        const responseAuth = creden.toObject();
        delete responseAuth.password;
        const jwt = jsonwebtoken.sign(responseAuth, process.env.SECRET_KEY, {
          expiresIn: "1h",
        });
        responseAuth.token = jwt;
        fs.appendFile(
          "../server/print.log",
          `viewed at ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} PM`
        );
        return res
          .status(HTTP_STATUS.OK)
          .send(success("Successfully logged in", responseAuth));
      } else {
        const now = moment();
        const lastHour = moment().subtract(1, "hours");
        console.log("auth", auth);
        const recentLoginAttempts = auth.loginAttempts.filter((attempt) =>
          moment(attempt.timestamp).isAfter(lastHour)
        );
        console.log("recentLoginAttempts", recentLoginAttempts);

        if (recentLoginAttempts.length >= 5) {
          auth.blocked = true;
          await auth.save();
          fs.appendFile(
            "../server/print.log",
            `User blocked for logging in with incorrect credentials at ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `
          );
          return res
            .status(HTTP_STATUS.FORBIDDEN)
            .send(
              success(
                "User is blocked due to too many unsuccessful login attempts."
              )
            );
        }

        auth.loginAttempts = recentLoginAttempts;
        console.log("auth.loginAttempts 1", auth.loginAttempts);
        auth.loginAttempts.push({ timestamp: now });
        console.log("auth.loginAttempts 2", auth.loginAttempts);
        await auth.save();
        fs.appendFile(
          "../server/print.log",
          `Logged with incorrect credentials at ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `
        );
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .send(success("Incorrect credentials"));
      }
    } catch (error) {
      console.log("Login error", error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(success("Could not login"));
    }
  }

  async editUserInfo(req, res) {
    try {
      const { email, role, name, address, phone } = req.body;

      const user = await userModel.findOne({ email: email });
      if (!user) {
        fs.appendFile(
          "../server/print.log",
          `User info not found for self edit at ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `
        );
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(success("User is not found"));
      }
      // Create an object to hold the fields to update
      const updatedFields = {};

      // Check if each field is provided and update it if necessary
      if (role) {
        updatedFields.role = role;
      }
      if (name) {
        updatedFields.name = name;
      }
      if (address) {
        updatedFields.address = address;
      }
      if (phone) {
        updatedFields.phone = phone;
      }

      // Update the user document with the provided fields
      const updatedUser = await userModel.findOneAndUpdate(
        { email: email },
        { $set: updatedFields },
        { new: true } // To return the updated user document
      );
      fs.appendFile(
        "../server/print.log",
        `USer updated his own data at ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `
      );
      return res
        .status(HTTP_STATUS.OK)
        .send(success("User information updated", updatedUser));
    } catch (error) {
      console.log("Login error", error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(success("Internal Server Error"));
    }
  }
  async editSelfInfo(req, res) {
    try {
      const { email, password, name, address, phone } = req.body;

      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jsonwebtoken.decode(token, process.env.SECRET_KEY);
      const user = await userModel.findOne({ email: decodedToken.email });
      if (!user) {
        fs.appendFile(
          "../server/print.log",
          `User not found at ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `
        );
        return res.status(404).send(success("User is not found"));
      }
      // Create an object to hold the fields to update
      const updatedFields = {};
      const updatedAuthFields = {};
      let flag = false;

      // Check if each field is provided and update it if necessary
      if (name) {
        updatedFields.name = name;
      }
      if (address) {
        updatedFields.address = address;
      }
      if (phone) {
        updatedFields.phone = phone;
      }
      if (email || password) {
        flag = true;
      }
      if (email) {
        updatedFields.email = email;
        updatedAuthFields.email = email;
      }

      // console.log(hashedPassword)
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10).then((hash) => {
          return hash;
        });
        updatedAuthFields.password = hashedPassword;
      }

      // Update the user document with the provided fields
      const updatedUser = await userModel.findOneAndUpdate(
        { email: decodedToken.email },
        { $set: updatedFields },
        { new: true } // To return the updated user document
      );
      if (flag) {
        const updatedAuth = await authModel.findOneAndUpdate(
          { email: decodedToken.email },
          { $set: updatedAuthFields },
          { new: true } // To return the updated user document
        );
      }
      fs.appendFile(
        "../server/print.log",
        `user info updated by admin at ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `
      );

      return res
        .status(200)
        .send(success("User information updated", updatedUser));
    } catch (error) {
      console.log("Login error", error);
      fs.appendFile(
        "../server/print.log",
        `Addmin couldnt update at ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `
      );
      return res.status(500).send(success("Internal server  error"));
    }
  }
  async deleteUser(req, res) {
    try {
      const { email } = req.body;
      const user = await userModel.findOne({ email: email });
      const auth = await authModel.findOne({ email: email });

      if (!user) {
        fs.appendFile(
          "../server/print.log",
          `couldnt find from user collections at ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `
        );
        return res
          .status(404)
          .send(
            failure("Couldnt find any data for deleting from user collection")
          );
        // return res.status(200).send(success("Successfully could delete data", cast));
      }
      if (!auth) {
        fs.appendFile(
          "../server/print.log",
          `couldnt find data from authenticat collections at ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `
        );
        return res
          .status(404)
          .send(
            failre(
              "Couldnt find any data for deleting from authentication collection"
            )
          );
      }
      const user1 = await userModel.deleteOne({ email: email });
      const auth1 = await authModel.deleteOne({ email: email });

      fs.appendFile(
        "../server/print.log",
        `Deleted user data at ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `
      );
      return res
        .status(200)
        .send(success("Successfully could delete data", user1));
    } catch (error) {
      console.log("Login error", error);
      return res.status(500).send(success("Internal server error"));
    }
  }
  async getUsers(req, res) {
    try {
      const users = await userModel.find({});
      fs.appendFile(
        "../server/print.log",
        `All users view at ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `
      );
      return res.status(200).send(success({ message: "List of users", users }));
    } catch (error) {
      fs.appendFile(
        "../server/print.log",
        `get all users failed at ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `
      );
      console.log("Get users", error);
      return res.status(500).send(failure("internal server error"));
    }
  }
  async addBalance(req, res, next) {
    try {
      const { balancedData } = req.body;
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jsonwebtoken.decode(token, process.env.SECRET_KEY);
      const user = await userModel.findOne({ email: decodedToken.email });
      if (!user) {
        fs.appendFile(
          "../server/print.log",
          `user not found to ad balance at ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `
        );
        return res.status(404).send(success("User is not found"));
      }
      user.balancedData += balancedData;

      // Save the updated user to the database
      await user.save();
      fs.appendFile(
        "../server/print.log",
        `User added balance at ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `
      );
      return res.status(200).send(success("Balance added successfully", user));
    } catch (error) {
      console.log("Add balance", error);
      fs.appendFile(
        "../server/print.log",
        `Add balance error at ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `
      );
      return res
        .status(500)
        .send(success({ message: "Internal server error" }));
    }
  }

  async notFound(req, res) {
    return res.status(404).send(success({ message: "URL Not found" }));
  }
}
module.exports = new authenController();
