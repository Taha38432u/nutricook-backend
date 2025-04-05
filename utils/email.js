const nodemailer = require("nodemailer");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;

    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = ` Taha Rasheed <rasheedtaha1111@gmail.com>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return 1;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject, text) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send(
      "Welcome",
      "Welcome to the Natours Family",
      `Hi ${this.firstName},\n\nWelcome to NutriCook! We're so excited to have you on board.\n\nVisit this link to get started: ${this.url}\n\nBest regards,\nTaha Rasheed`,
    );
  }

  async sendPasswordReset() {
    await this.send(
      "Reset Password",
      "Your password reset token (valid for 10 minutes only)",
      `Hi ${this.firstName},

You requested a password reset. Please use the link below to reset your password. This link is valid for only 10 minutes.

${this.url}

If you didn't request a password reset, please ignore this email or contact our support if you have concerns.

Best regards,  
Taha Rasheed`,
    );
  }
};
