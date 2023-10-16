const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "d4b49be584d049",
    pass: "3456c03bbc9613",
  },
});

module.exports = transporter;
